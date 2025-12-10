using DevExpress.Persistent.Base;

namespace CundiApi.DTOs;

public class TypePermissionDto
{
    public Guid Oid { get; set; }
    public string TargetType { get; set; }
    public SecurityPermissionState? ReadState { get; set; }
    public SecurityPermissionState? WriteState { get; set; }
    public SecurityPermissionState? CreateState { get; set; }
    public SecurityPermissionState? DeleteState { get; set; }
    public SecurityPermissionState? NavigateState { get; set; }
}
