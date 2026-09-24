# Deployment

## Production database backups

The application is deployed on Vercel and uses PostgreSQL through
`DATABASE_URL`. Vercel does not provide PostgreSQL backups for an external
database, and the current local URL still uses the placeholder host `HOST`, so
the managed database provider must be confirmed before launch.

Before production launch:

1. Create or select a managed PostgreSQL production database.
2. Enable that provider's automated daily backups and point-in-time recovery
   (PITR) in its dashboard. Retain daily backups for at least 14 days.
3. Store the provider's production connection string in the Vercel project's
   environment variables as `DATABASE_URL` for the Production environment.
   Never commit it to this repository.
4. Configure the provider's backup retention, encryption, and restore-access
   permissions for the production team.
5. Perform and record a restore drill before launch:

   ```powershell
   $env:PGPASSWORD = "<temporary-restore-password>"
   pg_restore --clean --if-exists --dbname "<temporary-restore-database-url>" backup.dump
   ```

6. Verify the restored database by running the Alembic migration check and
   the authentication smoke test:

   ```powershell
   cd backend
   .\venv\Scripts\python.exe -m alembic heads
   .\venv\Scripts\python.exe -m unittest discover -s tests -v
   ```

For an additional independent backup, run `pg_dump` from a protected scheduled
job and upload the encrypted output to a separate storage account. The job
must read `DATABASE_URL` and its storage credentials from the job's secret
store, never from source control:

```powershell
pg_dump --format=custom --file="sikamitra-$((Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')).dump" "$env:DATABASE_URL"
```

The backup job should alert on non-zero exit status, test that the dump is
readable with `pg_restore --list`, and periodically restore into an isolated
database. A backup is not considered verified until a restore succeeds.
