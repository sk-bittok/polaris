import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
	"/dashboard",
	"/livestock",
	"/breeds",
	"/health-records",
	"/weight-records",
	"/production-records",
];

export function AuthMiddleware(request: NextRequest) {
	const refreshToken = request.cookies.get("refreshToken")?.value;

	const isProtected = protectedRoutes.some((route) =>
		request.nextUrl.pathname.startsWith(route),
	);

	if (isProtected && !refreshToken) {
		const loginUrl = new URL("/login", request.url);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}
