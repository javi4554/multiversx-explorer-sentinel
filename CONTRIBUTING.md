# Contributing to MultiversX Explorer Sentinel

Thank you for your interest in contributing to MultiversX Explorer Sentinel! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be kind and constructive in your interactions with others.

## How Can I Contribute?

### Reporting Bugs

If you encounter a bug while using the extension, please report it by creating an issue in the GitHub repository. When filing a bug report, please include:

1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior vs. actual behavior
4. Screenshots (if applicable)
5. Browser version and OS information
6. Any relevant error messages from the console

### Suggesting Enhancements

We welcome suggestions for improving MultiversX Explorer Sentinel! To suggest an enhancement:

1. Create a new issue with the "enhancement" label
2. Clearly describe the feature you'd like to see
3. Explain why this would be valuable to users
4. Include mockups or examples if possible

### Pull Requests

We actively welcome pull requests from the community. Here's how to submit a PR:

1. Fork the repository
2. Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes with clear, descriptive commit messages
6. Push to your branch (`git push origin feature/your-feature-name`)
7. Open a pull request against the main branch

#### Pull Request Process

1. Ensure your code follows the existing style and structure
2. Update the README.md with details of significant changes if applicable
3. The PR should work properly in Chrome/Chromium browsers
4. PRs will be merged once reviewed and approved by a maintainer

## Development Setup

To set up the extension for local development:

1. Clone the repository: `git clone https://github.com/yourusername/multiversx-explorer-sentinel.git`
2. Navigate to `chrome://extensions/` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory
5. Make changes to the code and reload the extension to test

## Style Guidelines

### JavaScript

- Use clear and descriptive variable and function names
- Add comments for complex logic
- Follow modern ES6+ practices
- Format code consistently (consider using Prettier)

### HTML/CSS

- Maintain semantic markup
- Keep CSS organized and commented
- Use classes consistently
- Ensure UI is responsive and accessible

## Commit Messages

Write clear, concise commit messages that explain what changes were made and why:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Fix bug" not "Fixes bug")
- Limit the first line to 72 characters or less
- Reference issues and pull requests when relevant

Example:
```
Add search functionality to watchlist

- Implement real-time filtering of addresses
- Add clear search button
- Optimize performance for large watchlists

Fixes #42
```

## License

By contributing to MultiversX Explorer Sentinel, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

## Questions?

If you have any questions about contributing, feel free to create an issue with the "question" label.

Thank you for helping make MultiversX Explorer Sentinel better!
