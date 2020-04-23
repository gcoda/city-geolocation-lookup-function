#!/usr/bin/env bash

# gcloud config set project v-page

gcloud beta functions deploy geoQuery \
  --entry-point=geoQuery \
  --runtime=nodejs10 \
  --region=europe-west1 \
  --allow-unauthenticated \
  --env-vars-file=./env.yaml \
  --trigger-http
