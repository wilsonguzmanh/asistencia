output "frontend_url" {
  value = "http://${aws_eip.frontend.public_ip}"
}

output "backend_api_url" {
  value = "http://${aws_eip.backend.public_ip}:3000/api/v1"
}

output "ssh_backend" {
  value = "ssh -i $HOME/.ssh/iac-asistencia ubuntu@${aws_eip.backend.public_ip}"
}

output "ssh_frontend" {
  value = "ssh -i $HOME/.ssh/iac-asistencia ubuntu@${aws_eip.frontend.public_ip}"
}
