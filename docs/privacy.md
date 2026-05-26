# Privacy Policy for Alba

**Last Updated:** May 26, 2026

## Overview

Alba is a privacy-first Chrome extension designed to help users understand and reduce the environmental impact of their AI usage. This privacy policy explains our commitment to protecting your privacy and describes how Alba handles data.

## Our Privacy-First Approach

Alba was built from the ground up with privacy as a core principle. We believe that you should be able to track your environmental impact without sacrificing your privacy or sharing your personal data with third parties.

## Data Collection and Storage

### What We Don't Collect

Alba **does not collect, transmit, or store** any of the following:

- Your AI conversations or chat history
- Your browsing history
- Your personal information
- Your usage patterns or analytics
- Any data on external servers (Alba runs no analytics backend and stores nothing about you on a server)

The one exception is the optional, opt-in AI features described under **How Alba Works** below: when you use the AI optimizer, the single prompt you choose to optimize is sent to the Alba proxy; when you generate an Eco Wrapped recap, only your aggregate daily totals are sent. Your broader conversations and chat history are never transmitted.

### What Is Stored Locally

All data related to your usage of Alba is stored **locally on your device** using your browser's local storage. This includes:

- Your environmental impact metrics (energy, carbon, water usage)
- Your configuration preferences (region, model settings, theme)
- Your daily tracking data and historical statistics
- Your Wrapped recap data

**Important:** This data never leaves your device unless you explicitly choose to export it yourself (via CSV export).

## How Alba Works

### Local Processing

Alba's core calculations and tracking operate entirely within your browser:

- **Impact Calculations:** Energy, carbon, and water estimates are computed locally on your device based on your prompt length, selected model, and configured region — they are never sent anywhere
- **Local Optimization:** Basic prompt optimization happens entirely on your device without sending data anywhere
- **Dashboard and Tracking:** All statistics and visualizations are generated from locally stored data

### Optional AI-Powered Features

Alba offers two optional AI-powered features — the AI prompt optimizer and the Eco Wrapped recap. **No API keys or tokens are stored in or shipped with the extension.** When these features are used, requests are sent to the Alba proxy (a Cloudflare Worker at `https://alba-ai-proxy.lindsaygross32.workers.dev`), which holds the AI provider credential as a server-side secret and forwards the request to GitHub Models for processing:

- **Opt-In Only:** AI optimization is disabled by default and requires your explicit consent to enable; the Eco Wrapped recap is generated only when you request it
- **AI Optimizer — What Is Sent:** Only the prompt text you choose to optimize is sent to the Alba proxy and forwarded to GitHub Models for a compressed rewrite suggestion
- **Eco Wrapped — What Is Sent:** Only your daily usage totals (aggregate energy, carbon, and water numbers) are sent to the Alba proxy and forwarded to GitHub Models to generate the recap copy — never your prompts or conversations
- **No Keys in the Extension:** The AI provider token lives only as a secret on the proxy server; it is never embedded in, downloaded by, or exposed through the extension
- **Your Control:** You can enable or disable AI optimization at any time in the extension settings, and Eco Wrapped only runs on demand. If the proxy is unreachable, Alba falls back to local-only behavior
- **Third-Party Privacy:** GitHub's and Microsoft Azure's privacy policies apply to data processed by GitHub Models via the proxy

## Data You Control

### Export Your Data

You can export all your locally stored data at any time:

- Download your usage statistics as CSV files
- Use this data for personal records or reporting purposes
- Share your environmental impact data as you choose

### Delete Your Data

You have complete control over your data:

- Reset all statistics and data at any time through the extension settings
- Uninstalling the extension removes all locally stored Alba data
- No data remains on external servers because none was ever sent there

## Third-Party Services

### Alba Proxy → GitHub Models (Optional)

If you use the AI optimizer or Eco Wrapped:
- Requests are sent to the Alba proxy (`https://alba-ai-proxy.lindsaygross32.workers.dev`), which forwards them to GitHub Models for processing
- The AI optimizer sends only the prompt text you optimize; Eco Wrapped sends only your daily usage totals — neither sends your conversations
- The proxy holds the AI provider credential as a server-side secret; no key is stored in the extension
- GitHub's and Microsoft Azure's privacy policies and terms of service apply to the forwarded data
- You can disable the AI optimizer at any time, and Eco Wrapped only runs when you request it

### No Other Third Parties

Alba does not integrate with any analytics services, advertising networks, or other third-party data collection services.

## Permissions

Alba requests only the permissions necessary for its functionality:

- **Storage:** To save your preferences and usage data locally on your device
- **Host Permission (Alba Proxy):** Access to the Alba proxy (`https://alba-ai-proxy.lindsaygross32.workers.dev`) to enable the optional AI optimizer and Eco Wrapped recap when you choose to use them. The extension does not contact GitHub Models directly
- **Content Scripts:** Permission to run on specific AI chat websites (ChatGPT, Claude, Gemini, Perplexity) to inject the impact tracking interface

These permissions are used solely for the stated functionality and not for data collection or tracking. The content scripts only interact with the visible web pages you're using to display impact estimates and optimization suggestions.

## Open Source Transparency

Alba is open source, which means:

- Our code is publicly available for review
- Anyone can verify our privacy claims by examining the source code
- Community contributions are welcome
- Full transparency in how we handle data

You can view our source code at: [https://github.com/lindsaygross/Alba](https://github.com/lindsaygross/Alba)

## Children's Privacy

Alba does not knowingly collect any information from anyone, including children under the age of 13. Since we don't collect any personal data, Alba can be used by anyone while maintaining their privacy.

## Changes to This Privacy Policy

We may update this privacy policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. When we make changes:

- We will update the "Last Updated" date at the top of this policy
- Significant changes will be communicated through the extension or our GitHub repository
- Continued use of Alba after changes constitutes acceptance of the updated policy

## Your Rights

Under various privacy laws, you have rights regarding your data. With Alba:

- **Right to Access:** All your data is stored locally and accessible to you at any time
- **Right to Delete:** You can delete your data at any time through the extension settings
- **Right to Export:** You can export your data in CSV format at any time
- **Right to Opt-Out:** You can disable any optional features at any time

## Contact Us

If you have questions or concerns about this privacy policy or Alba's privacy practices:

- **GitHub Issues:** Open an issue on our [GitHub repository](https://github.com/lindsaygross/Alba/issues)
- **Email:** Contact the repository owner through GitHub

## Legal Compliance

Alba is designed to comply with major privacy regulations including:

- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Other applicable privacy laws

Our privacy-first, local-only approach inherently satisfies most privacy regulation requirements by not collecting or processing personal data on external servers.

## Summary

**The Bottom Line:** Alba is designed to give you complete privacy and control. Your data stays on your device, we don't track you, and you have full control over your information. We built Alba this way because we believe privacy is a fundamental right, not a feature.
