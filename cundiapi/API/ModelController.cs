using DevExpress.ExpressApp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CundiApi.API;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ModelController : ControllerBase
{
    public ModelController()
    {
    }

    [HttpGet("BusinessObjects")]
    public IActionResult GetBusinessObjects()
    {
        var PersistentTypes = XafTypesInfo.Instance.PersistentTypes
            .Where(t => t.IsVisible && t.IsPersistent)
            .Select(t => new
            {
                Label = t.Name,
                Value = t.FullName
            })
            .OrderBy(t => t.Label)
            .ToList();
        return Ok(PersistentTypes);
    }
}
