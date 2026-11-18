# Managed PR previews

GitHub-hosted workers build the exact head of same-repository, non-draft PRs.
A pinned operator-owned controller on the preview host validates writer access,
imports both images and migrates/seeds isolated synthetic databases. No production
credentials or data enter builds/previews. Production Dockerfiles are unchanged;
`Dockerfile.preview` supplies the runtime layout expected by the controller.

This project uses the `chefv` namespace at `chefv-pr-N-preview.chefeventhub.com`
and `api-chefv-pr-N-preview.chefeventhub.com`. The two-environment host pool is
shared with private-chef-template. Built PRs queue when both slots are occupied.
Separate names, ports, data, uploads and random service credentials prevent PR
number collisions across repositories. Both controllers serialize on one lock.

Email is rendered into private preview capture files, never sent through Resend.
Stripe credentials are deliberately invalid; Calendar/media providers have no
production credentials and the app network has no general outbound access.
No Sous Chef feature exists in this repository; preview AI configuration does not
add a feature which is absent from the application.

Seed retries preserve reviewer changes. ChefV's existing date/time request API,
not the template availability API, is used for synthetic booking acceptance.
Admin authentication, storefront/request rendering, captured notifications and
public upload/download are checked before publishing native GitHub deployment
links. Updates preserve data; close/merge removes exclusively owned resources.
Admin uses the owner-requested preview-only shared login. Never use it in production.

The canonical controller source remains in private-chef-template `ops/preview`.
Runtime installation and default-branch workflow availability are separate from
an application PR. Existing branches must include these preview prerequisites.
