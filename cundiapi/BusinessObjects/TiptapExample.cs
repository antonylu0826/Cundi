using DevExpress.Persistent.BaseImpl;
using DevExpress.Xpo;

namespace CundiApi.BusinessObjects;

public class TiptapExample : BaseObject
{
    public TiptapExample(Session session) : base(session) { }

    private string _Name;
    /// <summary>
    /// The name of the example note.
    /// </summary>
    public string Name
    {
        get { return _Name; }
        set { SetPropertyValue<string>(nameof(Name), ref _Name, value); }
    }

    private string _Content;
    /// <summary>
    /// The rich text content stored as HTML.
    /// </summary>
    [Size(SizeAttribute.Unlimited)]
    public string Content
    {
        get { return _Content; }
        set { SetPropertyValue<string>(nameof(Content), ref _Content, value); }
    }
}
