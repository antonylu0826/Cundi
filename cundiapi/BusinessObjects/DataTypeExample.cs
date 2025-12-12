using DevExpress.Persistent.Base;
using DevExpress.Persistent.BaseImpl;
using DevExpress.Xpo;

namespace CundiApi.BusinessObjects;

/// <summary>
/// A comprehensive example showing how to declare various data types in XPO.
/// This object demonstrates primitive types, strings, dates, enums, file attachments (images), and associations.
/// </summary>
public class DataTypeExample : BaseObject
{
    public DataTypeExample(Session session) : base(session) { }

    public override void AfterConstruction()
    {
        base.AfterConstruction();
        // Initialize default values here
        _BoolValue = true;
        _DateTimeValue = DateTime.Now;
    }

    #region String Types

    private string _Name;
    /// <summary>
    /// A standard string property with a default size (usually 100).
    /// </summary>
    public string Name
    {
        get { return _Name; }
        set { SetPropertyValue<string>(nameof(Name), ref _Name, value); }
    }

    private string _MemoValue;
    /// <summary>
    /// A string property with unlimited size, typically rendered as a multi-line text area (MemoEdit).
    /// </summary>
    [Size(SizeAttribute.Unlimited)]
    public string MemoValue
    {
        get { return _MemoValue; }
        set { SetPropertyValue<string>(nameof(MemoValue), ref _MemoValue, value); }
    }

    #endregion

    #region Numeric Types

    private int _IntValue;
    /// <summary>
    /// A standard integer property.
    /// </summary>
    public int IntValue
    {
        get { return _IntValue; }
        set { SetPropertyValue<int>(nameof(IntValue), ref _IntValue, value); }
    }

    private double _DoubleValue;
    /// <summary>
    /// A standard double-precision floating-point property.
    /// </summary>
    public double DoubleValue
    {
        get { return _DoubleValue; }
        set { SetPropertyValue<double>(nameof(DoubleValue), ref _DoubleValue, value); }
    }

    private decimal _DecimalValue;
    /// <summary>
    /// A decimal property, suitable for financial calculations.
    /// </summary>
    public decimal DecimalValue
    {
        get { return _DecimalValue; }
        set { SetPropertyValue<decimal>(nameof(DecimalValue), ref _DecimalValue, value); }
    }

    #endregion

    #region Date and Time

    private DateTime _DateTimeValue;
    /// <summary>
    /// A DateTime property.
    /// </summary>
    public DateTime DateTimeValue
    {
        get { return _DateTimeValue; }
        set { SetPropertyValue<DateTime>(nameof(DateTimeValue), ref _DateTimeValue, value); }
    }

    private TimeSpan _TimeSpanValue;
    /// <summary>
    /// A TimeSpan property, representing a duration.
    /// </summary>
    public TimeSpan TimeSpanValue
    {
        get { return _TimeSpanValue; }
        set { SetPropertyValue<TimeSpan>(nameof(TimeSpanValue), ref _TimeSpanValue, value); }
    }

    #endregion

    #region Logical and Enumerations

    private bool _BoolValue;
    /// <summary>
    /// A boolean property, typically rendered as a checkbox.
    /// </summary>
    public bool BoolValue
    {
        get { return _BoolValue; }
        set { SetPropertyValue<bool>(nameof(BoolValue), ref _BoolValue, value); }
    }

    private ExampleEnum _EnumValue;
    /// <summary>
    /// An enumeration property, typically rendered as a dropdown (ComboBox).
    /// </summary>
    public ExampleEnum EnumValue
    {
        get { return _EnumValue; }
        set { SetPropertyValue<ExampleEnum>(nameof(EnumValue), ref _EnumValue, value); }
    }

    #endregion

    #region Media (Images)


    /// <summary>
    /// An image stored as a byte array. 
    /// [Delayed] loads the data only when accessed to improve performance for large blobs.
    /// [ImageEditor] tells XAF to use an image upload/display control.
    /// </summary>
    [Delayed(true)]
    [ImageEditor]
    public byte[] ImageValue
    {
        get { return GetDelayedPropertyValue<byte[]>(nameof(ImageValue)); }
        set { SetDelayedPropertyValue<byte[]>(nameof(ImageValue), value); }
    }

    #endregion

    #region Associations (Relationships)

    /// <summary>
    /// The "Many" side of a One-to-Many relationship.
    /// [Association] pairs with the Master property in DataTypeExampleDetail.
    /// [Aggregated] means these details are part of this object (cascade delete).
    /// </summary>
    [Association("Master-Details"), DevExpress.Xpo.Aggregated]
    public XPCollection<DataTypeExampleDetail> Details
    {
        get { return GetCollection<DataTypeExampleDetail>(nameof(Details)); }
    }

    #endregion
}

/// <summary>
/// A child object to demonstrate associations (One-to-Many).
/// </summary>
public class DataTypeExampleDetail : BaseObject
{
    public DataTypeExampleDetail(Session session) : base(session) { }

    private string _DetailName;
    public string DetailName
    {
        get { return _DetailName; }
        set { SetPropertyValue<string>(nameof(DetailName), ref _DetailName, value); }
    }

    private DataTypeExample _Master;
    /// <summary>
    /// The "One" side of the One-to-Many relationship.
    /// </summary>
    [Association("Master-Details")]
    public DataTypeExample Master
    {
        get { return _Master; }
        set { SetPropertyValue<DataTypeExample>(nameof(Master), ref _Master, value); }
    }
}

/// <summary>
/// Enum definition for enumeration examples.
/// </summary>
public enum ExampleEnum
{
    OptionA,
    OptionB,
    OptionC
}
