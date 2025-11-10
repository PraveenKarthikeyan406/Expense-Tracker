import React, { useState } from 'react';

export default function ReportIssuePage({ user, onClose }) {
  const [formData, setFormData] = useState({
    issueType: 'bug',
    subject: '',
    description: '',
    priority: 'medium'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call to submit issue
    console.log('Issue reported:', formData);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="report-issue-page">
        <div className="success-message-container">
          <div className="success-icon">✅</div>
          <h3>Issue Reported Successfully!</h3>
          <p>Thank you for your feedback. We'll look into it shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-issue-page">
      <div className="profile-page-header">
        <button className="back-button" onClick={onClose}>
          <span>←</span> Back
        </button>
        <h2>Report an Issue</h2>
      </div>

      <div className="report-issue-content">
        <form onSubmit={handleSubmit} className="report-issue-form">
          <div className="form-group">
            <label htmlFor="issueType">Issue Type</label>
            <select
              id="issueType"
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              required
            >
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="improvement">Improvement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the issue..."
              rows="6"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Submit Issue
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
