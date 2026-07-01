# Showroom Demo: How to customise your own demo on RHDP

Demo content for Red Hat Demo Platform (RHDP) Solution Architects.

## Overview

**Audience:** Solution Architects  
**Duration:** 20 minutes  
**OpenShift Version:** 4.20

This presenter-led demo covers:
1. **Module 1:** Vue d'ensemble Technique (~6 min)
2. **Module 2:** Provisionner avec CNV et Field Source Content (~10 min)
3. **Module 3:** Skills Marketplace et bonnes pratiques (~4 min)

## Key Messages

1. **Provisionnez rapidement** - Clusters OpenShift multi-cloud en minutes avec CNV
2. **Automatisez le déploiement** - Field Source Content déploie via GitOps (Ansible/Helm)
3. **Réutilisez et partagez** - Skills Marketplace pour étendre vos démos
4. **GitOps simplifie tout** - Un repo Git = déploiement automatique

## Prerequisites

- Access to demo.redhat.com
- RHDP account
- Basic understanding of OpenShift and GitOps

## Files Structure

```
showroom-content/
├── site.yml              # Antora site configuration
├── ui-config.yml         # Showroom UI config (terminal + console)
├── antora.yml            # Content version metadata
└── content/
    └── modules/
        └── ROOT/
            ├── nav.adoc              # Navigation menu
            ├── pages/
            │   ├── index.adoc        # Introduction
            │   ├── 01-overview.adoc  # Module 1
            │   ├── 02-provisioning.adoc  # Module 2
            │   └── 03-skills.adoc    # Module 3
            └── assets/
                └── images/           # (for screenshots)
```

## Building Locally (Optional)

To preview the content locally with Antora:

```bash
cd showroom-content
npm install -g @antora/cli @antora/site-generator-default
antora site.yml
# Open gh-pages/index.html in browser
```

## Deploying to RHDP

This Showroom content can be deployed to RHDP using the Field Source Content workflow described in the demo itself!

### Option 1: Via Helm Chart (Recommended)

Add this to your field content repository's Helm chart:

```yaml
# In templates/showroom-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: showroom-demo
spec:
  template:
    spec:
      containers:
      - name: showroom
        image: quay.io/rhpds/showroom:latest
        volumeMounts:
        - name: content
          mountPath: /app/content
      volumes:
      - name: content
        configMap:
          name: showroom-content
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: showroom-content
data:
  # Content files here
```

### Option 2: Via ArgoCD Application

See the parent repository's `templates/` directory for ArgoCD Application examples.

## Resources

- [RHDP Catalog](https://catalog.demo.redhat.com/)
- [Field Source Content](https://github.com/agnosticd/core_workloads/tree/main/roles/ocp4_workload_field_content)
- [Skills Marketplace](https://github.com/rhpds/rhdp-skills-marketplace)
- [Example Repository](https://github.com/slallemand/rhdp-field-content-demo)

## License

Content follows Red Hat documentation standards and best practices.
