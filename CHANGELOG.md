# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.4.0] - 2024-11-21

### Adicionado

- **API Gateway**: Novo módulo de api-key para middleware
- **Logger**: Integração com informações de tracing
- **Tracing**: Novo módulo de tracing

### Alterado

- **Prisma IAM**: Consolidação do cliente Prisma e schema na mesma lib
- **Workspace**: Organização de imports e correção de problemas de linting

## [0.3.0] - 2024-11-21

### Adicionado

- **URL Shortener**:
  - Implementação do módulo completo
  - Getter apropriado para originalHost
- **Filtros**: Filtro global de exceções para erros do Prisma

### Infraestrutura

- **Workspace**:
  - Adicionado infraestrutura Terraform para desenvolvimento local em k8s
  - Melhoria nos Dockerfiles para reduzir tempo de build
  - Removido jobs de migração e geração, usando diretamente no Dockerfile

### Corrigido

- **Filtros**: Correção nos imports de erro do Prisma

## [0.2.0] - 2024-11-21

### Adicionado

- **IAM (Identity and Access Management)**:
  - Módulo de autenticação
  - Módulos de usuário e tenant
  - Módulo de seed
  - Cliente Prisma e schemas

### Alterado

- **IAM**: Extraído userHeaders e userJwtDTO para pasta shared
- **Prisma URL**: Movido arquivos para pasta src

### Testes

- **IAM**:
  - Adicionado testes faltantes para o módulo
  - Adicionado testes unitários para authController/service
- **URL Shortener**:
  - Adicionado testes unitários para urlController/Service

### Documentação

- Adicionada documentação Swagger

## [0.1.0] - 2024-11-21

### Adicionado

- **Logger**: Adicionado módulo de logging
- **Ferramentas**: API Gateway e validação de token

### Infraestrutura

- **Ferramentas**:
  - Adicionado endpoints faltantes ao KrakenD
  - Adicionado hooks de pre-commit e pre-push

### Outros

- Adicionado versionamento Node
- Commit inicial do projeto

[0.4.0]: https://github.com/enzotironi/url-shortener/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/enzotironi/url-shortener/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/enzotironi/url-shortener/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/enzotironi/url-shortener/releases/tag/v0.1.0
