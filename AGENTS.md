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

- Keep the introductory experience at the index route with client-side slide state, with account access on the public /auth route; no catalog is implied.
- Define welcome styles and button variants through the global semantic design system to keep the mobile introduction visually consistent.
- Use one root-mounted auth provider and identity-change subscription for account state; profile access uses the generated browser client and owner-only row policies.
- Keep recovery at the public /reset-password route and require a recovery link before password updates to avoid accidental signed-in password changes.
