// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/app/context/AuthContext";

// export default function ProtectedRoute(Component: any) {
//   return function WrappedComponent(props: any) {
//     const { user } = useAuth();
//     const router = useRouter();

//     useEffect(() => {
//       if (!user) {
//         router.push("/login"); // Si no hay usuario, redirigir a login
//       }
//     }, [user, router]);

//     if (!user) return null; // Evita mostrar contenido mientras redirige

//     return <Component {...props} />;
//   };
// }
