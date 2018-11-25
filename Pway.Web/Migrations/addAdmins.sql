INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId] )
SELECT u.Id, r.Id FROM [dbo].[AspNetUsers] u, [dbo].[AspNetRoles] r
WHERE u.Email in ('test@gmail.com', 'test@test.com') AND r.Name = 'Admin'