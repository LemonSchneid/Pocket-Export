import { type ChangeEvent, useState } from "react";

type ValidationState =
  | { status: "idle" }
  | { status: "valid"; filename: string; linkCount: number }
  | { status: "invalid"; message: string };

function validatePocketExport(file: File, html: string): ValidationState {
  if (file.name !== "ril_export.html") {
    return {
      status: "invalid",
      message: "Please select the original ril_export.html file from Pocket.",
    };
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const links = Array.from(document.querySelectorAll("a[href]"));

  if (links.length === 0) {
    return {
      status: "invalid",
      message:
        "We could not find any saved links in this file. Make sure it is a valid Pocket export.",
    };
  }

  return {
    status: "valid",
    filename: file.name,
    linkCount: links.length,
  };
}

function ImportPage() {
  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setValidation({ status: "idle" });
      return;
    }

    if (!file.name.endsWith(".html")) {
      setValidation({
        status: "invalid",
        message: "Only HTML files are supported for Pocket exports.",
      });
      return;
    }

    try {
      const html = await file.text();
      setValidation(validatePocketExport(file, html));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not read that file. Please try again.";
      setValidation({ status: "invalid", message });
    }
  };

  return (
    <section className="page">
      <h2>Import</h2>
      <p>Upload your Pocket export to begin importing.</p>
      <label className="stack" htmlFor="pocket-export">
        <span>Choose ril_export.html</span>
        <input
          id="pocket-export"
          type="file"
          accept=".html,text/html"
          onChange={handleFileChange}
        />
      </label>
      {validation.status === "valid" && (
        <p>
          ✅ {validation.filename} looks good. Found {validation.linkCount} saved
          items.
        </p>
      )}
      {validation.status === "invalid" && (
        <p role="alert">⚠️ {validation.message}</p>
      )}
    </section>
  );
}

export default ImportPage;
