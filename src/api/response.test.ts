import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import {
  formatRequestErrorResponse,
  formatResponse,
  formatSuccessResponse,
} from "./response";

type Matcher = Partial<APIGatewayProxyStructuredResultV2>;

describe("formatResponse", () => {
  test("marshalls object payload to json", () => {
    const payload = { object: { with: { fields: true } } };

    expect(formatResponse(payload)).toMatchObject({
      body: JSON.stringify(payload),
    });
  });

  test("adds json content type on non-empty payload", () => {
    expect(formatResponse("string")).toMatchObject({
      headers: { "content-type": "application/json" },
    });
  });

  test("returns empty object on empty payload", () => {
    expect(formatResponse()).toStrictEqual({});
  });
});

describe("formatRequestErrorResponse", () => {
  test("sets default statusCode", () => {
    expect(
      formatRequestErrorResponse("invalid request")
    ).toMatchObject<Matcher>({
      statusCode: 400,
    });
  });

  test("allows statusCode overriding", () => {
    expect(
      formatRequestErrorResponse("tea", "pot", 418)
    ).toMatchObject<Matcher>({
      statusCode: 418,
    });
  });
});

describe("formatSuccessResponse", () => {
  test("sets default statusCode", () => {
    expect(formatSuccessResponse()).toMatchObject<Matcher>({
      statusCode: 200,
    });
  });

  test("allows statusCode overriding", () => {
    expect(
      formatSuccessResponse({ no: "content" }, 204)
    ).toMatchObject<Matcher>({
      statusCode: 204,
    });
  });
});
