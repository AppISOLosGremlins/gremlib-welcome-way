# Probar el modo administrador

1. Aplicad la migración `supabase/migrations/20261104000100_staff_restock.sql` en la base de datos del entorno de prueba que ya contiene el catálogo y los roles de Gremlib. Podéis ejecutar el archivo con el editor SQL de esa base. Integrar el código en GitHub no aplica la migración.
2. Iniciad sesión con una cuenta de prueba creada normalmente. Para autorizarla, un responsable de la base debe usar su UUID de autenticación y ejecutar el siguiente ejemplo **después de que termine la migración**, sustituyendo el marcador. No se puede asignar un rol desde el perfil ni desde el registro.
   
   ```sql
   insert into public.user_roles (user_id, role)
   values ('<UUID de la cuenta>'::uuid, 'employee')
   on conflict (user_id, role) do nothing;
   ```

   El rol existente `admin` también habilita el acceso. Una cuenta sin ninguno de esos dos roles continúa directamente al inicio de cliente.
3. Tras identificaros, elegid **Entrar en modo administrador → Inicio → Gestión de stock**. La vista de lectura conserva catálogo y reseñas; ninguna de las dos vistas de una cuenta de personal permite comprar.
4. En un segundo navegador, iniciad sesión como cliente y abrid la ficha del mismo libro. Por ejemplo, para un libro con 5 unidades, reponer 2 debe dejar 7: pasa de crítico a bajo en gestión y el cliente ve 7 en la ficha. Las vistas abiertas de inventario, catálogo, ficha y cesta consultan el stock cada 8 segundos mientras están visibles.
5. La cesta de reposición guarda el borrador por cuenta durante la sesión de la pestaña. Confirmar suma las unidades a todos los libros en una sola transacción. El recibo interno impide aplicar dos veces la misma solicitud.
