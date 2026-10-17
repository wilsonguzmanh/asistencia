variable "aws_region" {
  type    = string
  default = "us-east-2"
}

variable "project_name" {
  type    = string
  default = "iac-asistencia"
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "public_key_path" {
  type    = string
  default = "~/.ssh/iac-asistencia.pub"
}

variable "my_ip_cidr" {
  type        = string
  description = "Tu IP publica con /32. Solo ella podra entrar por SSH"
}

variable "repo_url" {
  type        = string
  sensitive   = true
  description = "URL https del repo de GitHub (con token si es privado)"
}
