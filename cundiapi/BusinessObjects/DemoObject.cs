using DevExpress.Persistent.BaseImpl;
using DevExpress.Xpo;

namespace CundiApi.BusinessObjects;

public class DemoObject : BaseObject
{
    public DemoObject(Session session) : base(session) { }



    private string _Name;
    public string Name
    {
        get { return _Name; }
        set { SetPropertyValue<string>(nameof(Name), ref _Name, value); }
    }


    private string _StringValue;
    public string StringValue
    {
        get { return _StringValue; }
        set { SetPropertyValue<string>(nameof(StringValue), ref _StringValue, value); }
    }

    private int _IntValue;
    public int IntValue
    {
        get { return _IntValue; }
        set { SetPropertyValue<int>(nameof(IntValue), ref _IntValue, value); }
    }

    private DemoObjectEnum _EnumValue;
    public DemoObjectEnum EnumValue
    {
        get { return _EnumValue; }
        set { SetPropertyValue<DemoObjectEnum>(nameof(EnumValue), ref _EnumValue, value); }
    }


    private DateTime? _DateTimeValue;
    public DateTime? DateTimeValue
    {
        get { return _DateTimeValue; }
        set { SetPropertyValue<DateTime?>(nameof(DateTimeValue), ref _DateTimeValue, value); }
    }


    private decimal _DecimalValue;
    public decimal DecimalValue
    {
        get { return _DecimalValue; }
        set { SetPropertyValue<decimal>(nameof(DecimalValue), ref _DecimalValue, value); }
    }

    [Delayed(true)]
    public byte[] ImageValue
    {
        get { return GetDelayedPropertyValue<byte[]>(nameof(ImageValue)); }
        set { SetDelayedPropertyValue<byte[]>(nameof(ImageValue), value); }
    }

    private string _LongStringValue;
    [Size(SizeAttribute.Unlimited)]
    public string LongStringValue
    {
        get { return _LongStringValue; }
        set { SetPropertyValue<string>(nameof(LongStringValue), ref _LongStringValue, value); }
    }

    private bool _BoolValue;
    public bool BoolValue
    {
        get { return _BoolValue; }
        set { SetPropertyValue<bool>(nameof(BoolValue), ref _BoolValue, value); }
    }

    [Association("DemoObject-DemoDetails"), Aggregated]
    public XPCollection<DemoDetail> DemoDetails
    {
        get { return GetCollection<DemoDetail>(nameof(DemoDetails)); }
    }

    private string _TiptapValue;
    [Size(SizeAttribute.Unlimited)]
    public string TiptapValue
    {
        get { return _TiptapValue; }
        set { SetPropertyValue<string>(nameof(TiptapValue), ref _TiptapValue, value); }
    }
}

public class DemoDetail : BaseObject
{
    public DemoDetail(Session session) : base(session) { }

    private string _Name;
    public string Name
    {
        get { return _Name; }
        set { SetPropertyValue<string>(nameof(Name), ref _Name, value); }
    }

    private string _Remarks;
    [Size(SizeAttribute.Unlimited)]
    public string Remarks
    {
        get { return _Remarks; }
        set { SetPropertyValue<string>(nameof(Remarks), ref _Remarks, value); }
    }

    private DemoObject _Master;
    [Association("DemoObject-DemoDetails")]
    public DemoObject Master
    {
        get { return _Master; }
        set { SetPropertyValue<DemoObject>(nameof(Master), ref _Master, value); }
    }
}


public enum DemoObjectEnum
{
    None,
    Option1,
    Option2,
    Option3
}