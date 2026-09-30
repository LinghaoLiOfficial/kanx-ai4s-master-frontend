# kanx-ai4s-master frontend

Independent Next.js frontend for the generated `custom` profile.

```bash
pnpm install
pnpm dev
```

The application runs at http://localhost:3000 and calls the backend directly at the URL in
`NEXT_PUBLIC_API_BASE_URL`. The backend must allow `NEXT_PUBLIC_APP_URL` as a credentialed CORS
origin. Keep `.env` local and commit only `.env.example`.

The component gallery is available at http://localhost:3000/components. Reusable shadcn/ui
primitives live in `src/components/ui`; knowledge-specific compositions live in
`src/components/knowledge`. Import components directly from these modules. Theme colors and
surface styles are centralized in `src/app/globals.css`. Knowledge components receive data and
callbacks as props, so pages can connect them to their own queries without coupling the library
to the API client. The gallery uses local sample data and does not mutate backend state.

```bash
pnpm lint
pnpm test
pnpm build
```

Enabled capabilities are recorded in `capabilities.json`. Authentication keeps access tokens only
in memory and restores sessions through the backend refresh cookie. Production frontend and API
origins must use HTTPS. For browser uploads, configure the production S3 provider's bucket CORS to
allow the frontend origin and expose `ETag`.
