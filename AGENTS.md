<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the introductory experience at the index route, account access on /auth, and member options under the authenticated layout with /inicio as the post-login destination.
- Define welcome styles and button variants through the global semantic design system to keep the mobile introduction visually consistent.
- Use one root-mounted auth provider and identity-change subscription for account state; profile access uses the generated browser client and owner-only row policies.
- Keep recovery at the public /reset-password route and require a recovery link before password updates to avoid accidental signed-in password changes.
- Store roles separately from profiles and verify administrative access through authenticated server functions using owner-readable roles; clients cannot grant roles.
- Keep catalog, reviews and restock destinations in empty states until inventory and review workflows are explicitly requested; do not fabricate books or successful stock operations.
