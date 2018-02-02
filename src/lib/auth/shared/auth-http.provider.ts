// import { HTTP_INTERCEPTORS } from '@angular/common/http';
//
// import { TokenService } from './token.service';
// import { AuthInterceptor } from './auth.interceptor';
//
//
// export function AuthInterceptorFactory(tokenService: TokenService) {
//   return new AuthInterceptor(tokenService);
// }
//
// export function provideAuthInterceptor() {
//   return {
//     provide: HTTP_INTERCEPTORS,
//     useFactory: (AuthInterceptorFactory),
//     multi: true,
//     deps: [TokenService]
//   };
// }
