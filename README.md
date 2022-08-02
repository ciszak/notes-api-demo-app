# Notes API (demo app)

Hi there.

## Useful commands

- `pnpm test -- --maxWorkers=1` perform the jest unit tests
- `pnpm cdk deploy` deploy this stack to your default AWS account/region
- `pnpm cdk deploy --watch` deploy this stack to your default AWS account/region and watch for changes
- `pnpm cdk diff` compare deployed stack with current state
- `pnpm cdk destroy` remove stack

## Usage

API accepts and returns `application/json` content-type.

All requests have to be authenticated by sending _access_token_ in `Authentication` header.

### Objects

```ts
type Note = {
  id: string | undefined;
  title: string;
  body: string;
};
```

```ts
type Error = {
  message: string;
  details: any | undefined;
};
```

### API endpoints

- `POST /notes` - create a note

  Accepts `Note` in body. Field `id` should be left empty, as it's generated on the server.

  Returns `201` on success.  
  Returns `422` on malformed request and sends `Error` in response.

- `GET /notes` - list all notes

  Returns `200` on success and sends a `Note[]` in response.

- `GET /notes/:id` - retrieve a note

  Returns `200` on success and sends a `Note` in response.  
  Returns `404` on request to _non-existent_ resource.

- `POST /notes/:id` - update a note

  Accepts `Note` in body. Field `id` is overridden with with `:id` from request parameter.

  Returns `204` on success.  
  Returns `404` on request to _non-existent_ resource.  
  Returns `422` on malformed request and sends `Error` in response.

- `DELETE /notes/:id` - delete a note

  Returns `204` on success.  
  Deleting _non-existent_ resource is also treated as success and returns `204`.

## How to get a token

After deployment stack outputs signin-url. You can go there and register an user.  
You'll be redirected to a demo callback function that returns oauth2 response - grab `access_token` from there.

Alternatively: Change callback parameter in signin url to `https://localhost` and fetch token manualy with your favourite [API Client](https://insomnia.rest/) or if you preffer CLI with command like one bellow:

```bash
curl --request POST \
 --url ${COGNITO_DOMAIN}/oauth2/token \
 --header 'Content-Type: application/x-www-form-urlencoded' \
 --data grant_type=authorization_code \
 --data redirect_uri=https://localhost \
 --data client_id=${CLIENT_ID} \
 --data code=${CODE}
```

## Development

### Local

Although it's possible to run an API Gateway stack defined by AWS-CDK locally thanks to AWS-SAM, it's far from perfect. API Gateway Local will silently ignore the existence of any authorizers. That breaks the contract with Lambda integration.

That's why for local development I recommend relaying on unit / integration tests and than jump to remote execution on a development cloud deployment.

### Tests

You need to have DynamoDB Local running. You can use provided `docker-compose.yaml`:

```bash
docker compose up
```

Then run the test suite:

```bash
pnpm test -- --collectCoverage --verbose
```

Run tests with `--maxWorkers=1` to prevent concurrent tests from working on the same DynamoDB Table (optional, tests are safe to run concurrently).

### Remote

> NOTE: You need to have AWS credentials

Run command below to deploy to your active AWS account and watch for changes.

```bash
pnpm cdk deploy --watch
```
