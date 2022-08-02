#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NotesStack } from "../src/notes-stack";

const app = new cdk.App();

new NotesStack(app, "NotesStack", {
  userPoolDomainPrefix: "mmhmm-notes-app",
});
