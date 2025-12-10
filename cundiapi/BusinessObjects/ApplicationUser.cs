using DevExpress.ExpressApp.Security;
using DevExpress.Persistent.Base;
using DevExpress.Persistent.BaseImpl.PermissionPolicy;
using DevExpress.Xpo;
using System.ComponentModel;

namespace CundiApi.BusinessObjects;

[MapInheritance(MapInheritanceType.ParentTable)]
[DefaultProperty(nameof(DisplayName))]
[CurrentUserDisplayImage(nameof(Photo))]
public class ApplicationUser : PermissionPolicyUser, ISecurityUserWithLoginInfo, ISecurityUserLockout
{
    #region DefaultProperty => DisplayName

    private string _DisplayName;

    [Description("The DisplayName property represents the full name of the user. It is used as the default display name in the application.")]
    public string DisplayName
    {
        get { return _DisplayName; }
        set { SetPropertyValue<string>(nameof(DisplayName), ref _DisplayName, value); }
    }

    private string _Email;

    [Description("The Email property stores the email address of the user. It is used for communication and authentication purposes.")]
    public string Email
    {
        get { return _Email; }
        set { SetPropertyValue<string>(nameof(Email), ref _Email, value); }
    }

    [Description("The Photo property stores the user's profile picture as a byte array. It is displayed in the user interface to represent the user visually.")]
    [ImageEditor(ListViewImageEditorMode = ImageEditorMode.PictureEdit,
    DetailViewImageEditorMode = ImageEditorMode.PictureEdit)]
    public byte[] Photo
    {
        get { return GetPropertyValue<byte[]>(nameof(Photo)); }
        set
        {
            SetPropertyValue<byte[]>(nameof(Photo), value);
        }
    }

    protected override void OnSaving()
    {
        base.OnSaving();
        if (string.IsNullOrEmpty(DisplayName))
            DisplayName = UserName;
    }

    #endregion


    int accessFailedCount;
    DateTime lockoutEnd;

    public ApplicationUser(Session session) : base(session) { }

    [Browsable(false)]
    public int AccessFailedCount
    {
        get { return accessFailedCount; }
        set { SetPropertyValue(nameof(AccessFailedCount), ref accessFailedCount, value); }
    }

    [Browsable(false)]
    public DateTime LockoutEnd
    {
        get { return lockoutEnd; }
        set { SetPropertyValue(nameof(LockoutEnd), ref lockoutEnd, value); }
    }

    [Browsable(false)]
    [NonCloneable]
    [Aggregated, Association("User-LoginInfo")]
    public XPCollection<ApplicationUserLoginInfo> LoginInfo
    {
        get { return GetCollection<ApplicationUserLoginInfo>(nameof(LoginInfo)); }
    }

    IEnumerable<ISecurityUserLoginInfo> IOAuthSecurityUser.UserLogins => LoginInfo.OfType<ISecurityUserLoginInfo>();

    ISecurityUserLoginInfo ISecurityUserWithLoginInfo.CreateUserLoginInfo(string loginProviderName, string providerUserKey)
    {
        ApplicationUserLoginInfo result = new ApplicationUserLoginInfo(Session);
        result.LoginProviderName = loginProviderName;
        result.ProviderUserKey = providerUserKey;
        result.User = this;
        return result;
    }
}
