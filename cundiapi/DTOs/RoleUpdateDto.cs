using DevExpress.Persistent.Base;

namespace CundiApi.DTOs;

public class RoleUpdateDto
{
    public Guid Oid { get; set; }
    public string Name { get; set; }
    public bool IsAdministrative { get; set; }
    public SecurityPermissionPolicy PermissionPolicy { get; set; }
    public List<TypePermissionDto> TypePermissions { get; set; }
}
