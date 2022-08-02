import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpUserPoolAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

interface NotesStackProps extends StackProps {
  /**
   * Needs to be regionally unique
   */
  userPoolDomainPrefix: string;
}

export class NotesStack extends Stack {
  constructor(scope: Construct, id: string, props: NotesStackProps) {
    super(scope, id, props);

    const notesTable = new Table(this, "notes", {
      partitionKey: {
        name: "owner_id",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      // demo setting
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const api = new HttpApi(this, "NotesApi");

    const userPool = new UserPool(this, "NotesUserPool", {
      selfSignUpEnabled: true,
      standardAttributes: { email: { required: true } },
      autoVerify: { email: true },

      // it's just a demo
      removalPolicy: RemovalPolicy.DESTROY,
      passwordPolicy: {
        requireDigits: false,
        requireLowercase: false,
        requireSymbols: false,
        requireUppercase: false,
      },
    });

    const domain = userPool.addDomain("UserPoolDomain", {
      cognitoDomain: { domainPrefix: props.userPoolDomainPrefix },
    });

    const callbackUrls = [
      "https://localhost",
      `${api.apiEndpoint}/auth-callback`,
    ];

    const userPoolClient = new UserPoolClient(this, "ApiUserPoolClient", {
      userPool,
      oAuth: { callbackUrls },
    });

    const authorizer = new HttpUserPoolAuthorizer("Authorizer", userPool, {
      userPoolClients: [userPoolClient],
    });

    const environment = {
      NOTES_TABLE: notesTable.tableName,
    };

    const createFn = new NodejsFunction(this, "create", {
      entry: "src/api/notes/create.ts",
      environment,
    });

    const listFn = new NodejsFunction(this, "list", {
      entry: "src/api/notes/list.ts",
      environment,
    });

    const getFn = new NodejsFunction(this, "get", {
      entry: "src/api/notes/get.ts",
      environment,
    });

    const updateFn = new NodejsFunction(this, "update", {
      entry: "src/api/notes/update.ts",
      environment,
    });

    const removeFn = new NodejsFunction(this, "remove", {
      entry: "src/api/notes/remove.ts",
      environment,
    });

    notesTable.grantReadData(listFn);
    notesTable.grantReadData(getFn);
    notesTable.grantWriteData(createFn);
    notesTable.grantReadWriteData(updateFn);
    notesTable.grantReadWriteData(removeFn);

    api.addRoutes({
      path: "/notes",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("list", listFn),
      authorizer,
    });

    api.addRoutes({
      path: "/notes",
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration("create", createFn),
      authorizer,
    });

    api.addRoutes({
      path: "/notes/{id}",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("get", getFn),
      authorizer,
    });

    api.addRoutes({
      path: "/notes/{id}",
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration("update", updateFn),
      authorizer,
    });

    api.addRoutes({
      path: "/notes/{id}",
      methods: [HttpMethod.DELETE],
      integration: new HttpLambdaIntegration("remove", removeFn),
      authorizer,
    });

    api.addRoutes({
      path: "/auth-callback",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "auth-callback-demo",
        new NodejsFunction(this, "auth-callback", {
          entry: "./src/callback.ts",
          environment: {
            REDIRECT_URI: `${api.apiEndpoint}/auth-callback`,
            CLIENT_ID: userPoolClient.userPoolClientId,
            AUTH_ENDPOINT: domain.baseUrl(),
          },
        })
      ),
    });

    new CfnOutput(this, "signin-url", {
      value: domain.signInUrl(userPoolClient, {
        redirectUri: `${api.apiEndpoint}/auth-callback`,
      }),
    });
    new CfnOutput(this, "api-url", { value: api.apiEndpoint });
  }
}
