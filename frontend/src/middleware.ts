import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get('admin_token')?.value;
  const studentToken = request.cookies.get('student_token')?.value;

  // 1. Redirigir si el administrador ya cuenta con sesión e intenta ingresar a login
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Redirigir si el estudiante ya cuenta con sesión e intenta ingresar a su login
  if (pathname === '/login' || pathname === '/login/') {
    if (studentToken) {
      return NextResponse.redirect(new URL('/asistencia', request.url));
    }
    return NextResponse.next();
  }

  // 3. Proteger rutas administrativas /admin/* (excepto login)
  if (pathname.startsWith('/admin')) {
    if (!adminToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Proteger rutas de estudiantes (/asistencia, /historial, /estudiante)
  if (
    pathname.startsWith('/asistencia') ||
    pathname.startsWith('/historial') ||
    pathname.startsWith('/estudiante')
  ) {
    if (!studentToken) {
      const studentLoginUrl = new URL('/login', request.url);
      studentLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(studentLoginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/asistencia/:path*',
    '/historial/:path*',
    '/estudiante/:path*',
    '/login',
  ],
};
