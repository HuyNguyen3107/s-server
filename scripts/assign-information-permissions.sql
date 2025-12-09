-- Gán quyền INFORMATION cho Super Admin role

-- Lấy role ID
DO $$
DECLARE
  super_admin_role_id UUID;
  information_permissions RECORD;
BEGIN
  -- Tìm Super Admin role
  SELECT id INTO super_admin_role_id
  FROM roles
  WHERE name IN ('Super Admin', 'SUPER_ADMIN', 'super_admin')
  LIMIT 1;

  IF super_admin_role_id IS NULL THEN
    RAISE NOTICE 'Super Admin role not found!';
    RETURN;
  END IF;

  RAISE NOTICE 'Super Admin role ID: %', super_admin_role_id;

  -- Gán tất cả quyền INFORMATION cho Super Admin
  FOR information_permissions IN
    SELECT id, name
    FROM permissions
    WHERE name LIKE 'INFORMATION_%'
  LOOP
    -- Kiểm tra xem đã có chưa
    IF NOT EXISTS (
      SELECT 1
      FROM role_permissions
      WHERE role_id::text = super_admin_role_id::text
        AND permission_id::text = information_permissions.id::text
    ) THEN
      -- Chèn quyền mới
      INSERT INTO role_permissions (id, role_id, permission_id)
      VALUES (gen_random_uuid(), super_admin_role_id, information_permissions.id);
      
      RAISE NOTICE 'Assigned permission: %', information_permissions.name;
    ELSE
      RAISE NOTICE 'Permission already assigned: %', information_permissions.name;
    END IF;
  END LOOP;

  RAISE NOTICE 'All INFORMATION permissions assigned successfully!';
END $$;
