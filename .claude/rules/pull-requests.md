---
description: Guidelines for creating pull requests
globs:
  - "**/*"
alwaysApply: false
---

# Rule: Pull Request Creation

## Process

When code is ready to be merged via pull request:

1. **Prepare PR Content**: Create a detailed write-up with:
   - PR Title (following conventional commit format)
   - PR Description (summary, changes, test plan, next steps)
   - Branch information

2. **Notify User**: Inform the user that the PR is ready to be created manually with the prepared content

3. **User Creates PR**: The user will create the PR manually on GitHub using the provided content

4. **Continue Work**: Move on to the next task once user confirms they'll handle the PR

## Do Not

- Do not attempt to use `gh pr create` command (not available)
- Do not wait for PR to be created before continuing
- Do not merge or approve PRs

## PR Description Format

Include these sections:
- **Summary**: High-level overview of changes
- **Changes**: Bulleted list of specific modifications
- **Test Plan**: Checklist of items to verify
- **Files Changed**: Statistics and key files
- **Next Steps**: What comes after this PR is merged

## Example

"Your pull request is ready to create on GitHub. Here's the content:

**Title:** feat: implement data architecture

**Description:** [formatted markdown with all sections]

You can create it at: https://github.com/user/repo/compare/main...branch-name

Let me know when you're ready to move on to the next task!"
