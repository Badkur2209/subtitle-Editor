// export default function HelpSupport() {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold text-gray-900 mb-4">Help & Support</h1>
//       <p className="text-gray-600">Get help and support for using the subtitle editor.</p>
//     </div>
//   );
// }

import React, { useState, ChangeEvent, FormEvent } from "react";

interface TicketFormData {
  issueTitle: string;
  description: string;
  screenLocation: string;
  contactEmail: string;
  priority: "Low" | "Medium" | "High";
  attachments: File[];
}

export default function HelpSupport() {
  const [formData, setFormData] = useState<TicketFormData>({
    issueTitle: "",
    description: "",
    screenLocation: "",
    contactEmail: "",
    priority: "Medium",
    attachments: [],
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [showGuidance, setShowGuidance] = useState(false);
  const screenOptions = [
    "Main Editor",
    "Timeline View",
    "Export Screen",
    "Settings",
    "File Import",
    "Preview Player",
    "Subtitle Sync",
    "Font & Styling",
    "Project Management",
    "Other",
  ];

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  }

  function removeAttachment(index: number) {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  }

  function generateTicketNumber() {
    return "SUB-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const ticket = generateTicketNumber();
    setTicketNumber(ticket);
    setIsSubmitted(true);
    // TODO: perform actual API POST here
    console.log("Submitted:", { ...formData, ticketNumber: ticket });
  }

  if (isSubmitted) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="text-green-500 text-4xl mb-2">✓</div>
          <h2 className="text-xl font-semibold mb-1">Ticket Submitted!</h2>
          <p>
            Your ticket number is <strong>{ticketNumber}</strong>.
          </p>
          <p className="text-gray-600 mt-2">We’ll get back to you soon.</p>
          <button
            onClick={() => {
              setFormData({
                issueTitle: "",
                description: "",
                screenLocation: "",
                contactEmail: "",
                priority: "Medium",
                attachments: [],
              });
              setIsSubmitted(false);
              setTicketNumber("");
            }}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Help & Support
      </h1>
      <p className="text-gray-600 mb-6">
        Get help and support for using the subtitle editor.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div>
            <label className="block font-medium mb-1">Issue Title *</label>
            <input
              name="issueTitle"
              value={formData.issueTitle}
              onChange={handleInputChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. Subtitle sync not saving"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Screen/Feature *</label>
            <select
              name="screenLocation"
              value={formData.screenLocation}
              onChange={handleInputChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select...</option>
              {screenOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={5}
              className="w-full border rounded px-3 py-2"
              placeholder="Describe steps, expected vs actual, etc."
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Contact Email *</label>
            <input
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleInputChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Attachments</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="block"
            />
            {formData.attachments.length > 0 && (
              <ul className="mt-2 space-y-1">
                {formData.attachments.map((file, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span className="text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Raise Ticket
          </button>
        </form>

        <aside className="space-y-6">
          <div className="border rounded p-4">
            <button
              onClick={() => setShowGuidance((s) => !s)}
              className="w-full text-left font-medium"
            >
              Reporting Guidelines {showGuidance ? "▲" : "▼"}
            </button>
            {showGuidance && (
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Be specific: clear title</li>
                <li>Step-by-step reproduction</li>
                <li>Expected vs actual outcome</li>
                <li>Include screenshots/videos</li>
              </ul>
            )}
          </div>

          <div className="border rounded p-4 space-y-2 text-sm">
            <h2 className="font-medium">Other Resources</h2>
            <a href="/faq" className="block text-indigo-600 hover:underline">
              📚 FAQ & Knowledge Base
            </a>
            <a
              href="/tutorials"
              className="block text-indigo-600 hover:underline"
            >
              🎥 Video Tutorials
            </a>
            <a
              href="/user-guide"
              className="block text-indigo-600 hover:underline"
            >
              📖 User Guide
            </a>
            <a
              href="mailto:support@subtitleeditor.com"
              className="block text-indigo-600 hover:underline"
            >
              ✉️ Email Support
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
