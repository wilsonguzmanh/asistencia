# iac-asistencia - CloudFormation con stacks anidados

```
iac-asistencia/
├── main.yaml             # Stack raiz (orquesta los demas)
├── network.yaml          # VPC, IGW, subredes, rutas
├── security-groups.yaml  # SG Frontend y Backend
├── nacls.yaml            # Network ACLs
└── ec2-server.yaml       # Servidor reutilizable (x2: frontend y backend)
```

## Despliegue

Los stacks anidados necesitan estar en S3. `package` los sube y reescribe
las rutas locales de `TemplateURL` automaticamente.

```bash
# 1. Bucket para las plantillas (una sola vez)
aws s3 mb s3://mi-bucket-cfn-plantillas

# 2. Validar
pip install cfn-lint
cfn-lint *.yaml

# 3. Empaquetar (sube las plantillas hijas y genera packaged.yaml)
aws cloudformation package \
  --template-file main.yaml \
  --s3-bucket mi-bucket-cfn-plantillas \
  --s3-prefix iac-asistencia \
  --output-template-file packaged.yaml

# 4. Desplegar
aws cloudformation deploy \
  --template-file packaged.yaml \
  --stack-name iac-asistencia \
  --parameter-overrides KeyName=mi-key AdminSshIp=190.10.20.30/32
```

Agrega `packaged.yaml` al `.gitignore`: es un artefacto generado.

## Ver salidas

```bash
aws cloudformation describe-stacks --stack-name iac-asistencia \
  --query "Stacks[0].Outputs" --output table
```
