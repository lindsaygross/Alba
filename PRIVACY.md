# Privacy Policy for Alba Chrome Extension

**Last Updated:** November 23, 2025

## Overview

Alba is a privacy-first Chrome extension that helps users understand the environmental impact of their AI usage. This privacy policy explains what data we collect, how we use it, and your rights regarding your information.

## Data Collection and Storage

### Data Stored Locally

Alba stores the following data **locally on your device** using Chrome's storage API:

- **Usage metrics**: Energy (Wh), carbon (gCO₂), and water (mL) estimates for your AI prompts
- **Prompt metadata**: Timestamp, AI platform used (ChatGPT, Claude, Gemini, etc.), and modality (text, image, code)
- **User preferences**: Extension settings including:
  - Extension enabled/disabled state
  - Optimizer toggle preferences
  - Selected model profile and region
  - Theme preferences
  - Daily reset preferences

**Important**: All this data is stored locally in your browser. Alba does NOT collect, transmit, or store your actual prompt content or conversations.

### Data Transmitted to External Services

Alba may transmit data to external services only in specific, optional scenarios:

1. **Remote Prompt Optimizer** (Optional Feature):
   - When enabled, your prompt text is sent to our API endpoint (`https://alba-ten.vercel.app/api/optimize`)
   - The API uses OpenAI's API to suggest a more concise version of your prompt
   - **Your prompts are not stored** on our servers; they are processed in real-time and discarded
   - You can disable this feature at any time in the extension settings

2. **Wrapped Recap** (Optional Feature):
   - When you request a "Wrapped" summary, aggregated statistics (total energy, carbon, water saved) are sent to our API endpoint (`https://alba-ten.vercel.app/api/wrapped`)
   - The API generates a narrative summary using OpenAI's API
   - **No individual prompts or identifying information** are sent, only aggregate numbers
   - This feature is only activated when you explicitly click the "Wrapped" button

### Third-Party Services

- **OpenAI API**: When using optional remote features (optimizer, wrapped), your data is processed by OpenAI's API subject to [OpenAI's Privacy Policy](https://openai.com/privacy/)
- Alba does NOT use any analytics, tracking, or advertising services

## Data We Do NOT Collect

- Your AI conversation content or chat history
- Personally identifiable information (name, email, etc.)
- Browsing history outside of supported AI platforms
- Account credentials or authentication tokens
- IP addresses or device identifiers

## Data Usage

The data collected is used exclusively to:

- Calculate and display environmental impact estimates for your AI usage
- Provide daily and per-conversation footprint summaries
- Generate optimization suggestions (when enabled)
- Allow you to track and export your environmental footprint over time

## Data Sharing

Alba does NOT:

- Sell your data to third parties
- Share your data with advertisers
- Use your data for marketing purposes
- Provide your data to any third party except as required by law

## Data Retention and Deletion

- All local data remains on your device until you explicitly delete it
- You can reset daily totals at any time using the "Reset daily totals" button in the popup
- You can export your data as CSV before deletion
- Uninstalling the extension deletes all locally stored data
- Data sent to our API endpoints for remote optimization or wrapped summaries is not retained after processing

## User Rights

You have the right to:

- **Access**: View all data stored by Alba in the extension popup and export it as CSV
- **Delete**: Clear your data at any time by resetting totals or uninstalling the extension
- **Control**: Disable remote features (optimizer, wrapped) to prevent any data transmission
- **Opt-out**: Disable the extension entirely while keeping it installed

## Permissions Explained

Alba requests the following Chrome permissions:

- **Storage**: To save your usage metrics and preferences locally on your device
- **Host Permissions** (`https://alba-ten.vercel.app/*`): To communicate with our API for optional remote features (optimizer, wrapped)
- **Content Scripts**: To inject impact estimates on supported AI platforms (ChatGPT, Claude, Gemini, Perplexity)

## Children's Privacy

Alba does not knowingly collect information from children under 13. If you believe a child has provided data to Alba, please contact us to have it removed.

## Changes to This Privacy Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last Updated" date at the top of this document. Continued use of Alba after changes constitutes acceptance of the updated policy.

## Open Source

Alba is open-source software. You can review our code at [https://github.com/lindsaygross/Alba](https://github.com/lindsaygross/Alba) to verify our privacy practices.

## Contact

For privacy-related questions or concerns, please contact us:

- **GitHub Issues**: [https://github.com/lindsaygross/Alba/issues](https://github.com/lindsaygross/Alba/issues)
- **Repository**: [https://github.com/lindsaygross/Alba](https://github.com/lindsaygross/Alba)

## Compliance

Alba is designed to comply with:

- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)

By using Alba, you acknowledge that you have read and understood this privacy policy.
