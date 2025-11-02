// src/pages/Verify.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ConfidenceMeter } from "../components/ui/ConfidenceMeter";
import { VerdictBadge } from "../components/ui/VerdictBadge";
import { EvidenceCard, Evidence } from "../components/ui/EvidenceCard";
import "./Verify.css";

// ADD THIS LINE
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface VerificationResult {
  verdict: "Real" | "Fake" | "Misleading" | "Unverified";
  summary: string;
  proofs: string[];
  safety_status?: string;
  safety_check?: any;
}

const verdictMapping: Record<
  VerificationResult["verdict"],
  "Verified" | "Fake" | "Possibly Misleading"
> = {
  Real: "Verified",
  Fake: "Fake",
  Misleading: "Possibly Misleading",
  Unverified: "Possibly Misleading",
};

const getConfidenceScore = (verdict: VerificationResult["verdict"]): number => {
  switch (verdict) {
    case "Real":
      return 90;
    case "Fake":
      return 85;
    case "Misleading":
      return 60;
    case "Unverified":
      return 30;
    default:
      return 0;
  }
};

const Verify: React.FC = () => {
  const [mode, setMode] = useState<"text" | "image" | "link">("text");
  const [textToVerify, setTextToVerify] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState(""); // ADD THIS
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth");
  }, [isAuthenticated, navigate]);

  // ------------- TEXT VERIFICATION -------------
  const handleVerifyText = async () => {
    if (!textToVerify.trim()) {
      setError("Please enter text to verify.");
      return;
    }
    if (!token) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/verify-text`, { // UPDATED
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: textToVerify }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Verification failed.");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------- IMAGE VERIFICATION -------------
  const handleVerifyImage = async () => {
    if (!imageFile) {
      setError("Please select an image to verify.");
      return;
    }
    if (!token) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch(`${BACKEND_URL}/api/verify-image`, { // UPDATED
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Verification failed.");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------- LINK VERIFICATION ------------- // ADD THIS FUNCTION
  const handleVerifyLink = async () => {
    if (!linkUrl.trim()) {
      setError("Please enter a URL to verify.");
      return;
    }
    if (!token) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/verify-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: linkUrl }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Verification failed.");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------- IMAGE UPLOAD HANDLER -------------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="verify-container">
      <h1>Verify Content</h1>

      {/* Mode Switch - UPDATED */}
      <div className="mode-switch">
        <button
          className={mode === "text" ? "active" : ""}
          onClick={() => setMode("text")}
        >
          Text
        </button>
        <button
          className={mode === "image" ? "active" : ""}
          onClick={() => setMode("image")}
        >
          Image
        </button>
        <button
          className={mode === "link" ? "active" : ""}
          onClick={() => setMode("link")}
        >
          Link
        </button>
      </div>

      {/* TEXT MODE */}
      {mode === "text" && (
        <div className="verify-section">
          <textarea
            className="text-input"
            value={textToVerify}
            onChange={(e) => setTextToVerify(e.target.value)}
            placeholder="Paste news article or social post..."
            rows={10}
          />
          <button
            onClick={handleVerifyText}
            disabled={isLoading || !textToVerify.trim()}
          >
            {isLoading ? "Verifying..." : "Verify Text"}
          </button>
        </div>
      )}

      {/* IMAGE MODE */}
      {mode === "image" && (
        <div className="verify-section">
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{ width: "300px", margin: "1rem 0", borderRadius: "8px" }}
            />
          )}
          <button
            onClick={handleVerifyImage}
            disabled={isLoading || !imageFile}
          >
            {isLoading ? "Verifying..." : "Verify Image"}
          </button>
        </div>
      )}

      {/* LINK MODE - ADD THIS SECTION */}
      {mode === "link" && (
        <div className="verify-section">
          <input
            type="url"
            className="text-input"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Paste URL to verify (e.g., https://example.com)"
          />
          <button
            onClick={handleVerifyLink}
            disabled={isLoading || !linkUrl.trim()}
          >
            {isLoading ? "Verifying..." : "Verify Link"}
          </button>
        </div>
      )}

      {/* ERROR */}
      {error && <p className="error-message">{error}</p>}

      {/* RESULTS */}
      {result && (
        <div className="results-section">
          <div className="verdict-display">
            <VerdictBadge
              verdict={
                verdictMapping[result.verdict] as
                  | "Real"
                  | "Fake"
                  | "Possibly Misleading"
              }
            />
            <ConfidenceMeter
              confidence={getConfidenceScore(result.verdict)}
              verdict={
                verdictMapping[result.verdict] as
                  | "Verified"
                  | "Fake"
                  | "Possibly Misleading"
              }
            />
          </div>

          <h3>Summary:</h3>
          <p>{result.summary}</p>

          {/* Show safety status for links */}
          {result.safety_status && (
            <>
              <h3>Safety Status:</h3>
              <p>{result.safety_status}</p>
            </>
          )}

          <h3>Proofs:</h3>
          <div className="proofs-list">
            {result.proofs.map((proof, idx) => (
              <EvidenceCard
                key={idx}
                evidence={
                  {
                    title: proof,
                    source: "AI Verification",
                    url: "#",
                  } as Evidence
                }
                type="factCheck"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify;