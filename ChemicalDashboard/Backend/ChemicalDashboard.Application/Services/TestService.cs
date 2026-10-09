using ChemicalDashboard.Application.Interfaces.Repositories;
using ChemicalDashboard.Application.Interfaces.Services;
using ChemicalDashboard.Contracts.Test;
using Microsoft.Extensions.Logging;

namespace ChemicalDashboard.Application.Services;

/// <summary>
/// پیاده‌سازی لایه سرویس برای رکوردهای آزمایشی
/// این سرویس کاملاً مستقل از تکنولوژی پایگاه داده (SQL یا Dapper) بوده و فقط با اینترفیس ریپازیتوری کار می‌کند
/// </summary>
public sealed class TestService : ITestService
{
    private readonly ITestRepository _repository;
    private readonly ILogger<TestService> _logger;

    /// <summary>
    /// تزریق وابستگی‌های مورد نیاز لایه سرویس از طریق Constructor Injection
    /// </summary>
    /// <param name="repository">اینترفیس دسترسی به داده‌های تستی</param>
    /// <param name="logger">ثبت لاگ‌های ساختاریافته</param>
    public TestService(ITestRepository repository, ILogger<TestService> logger)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// دریافت تمام رکوردهای آزمایشی از طریق ریپازیتوری
    /// </summary>
    public async Task<IReadOnlyList<TestRecordResponseDto>> GetAllRecordsAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("درخواست دریافت رکوردهای آزمایشی به لایه سرویس رسید.");
        
        var records = await _repository.GetAllAsync(cancellationToken);

        _logger.LogInformation("تعداد {Count} رکورد با موفقیت از ریپازیتوری دریافت شد.", records.Count);
        return records;
    }

    /// <summary>
    /// اعتبارسنجی منطق تجاری و ایجاد رکورد جدید در دیتابیس
    /// </summary>
    public async Task<bool> CreateRecordAsync(CreateTestRecordRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        // اعتبارسنجی مقادیر ورودی و حذف فاصله‌های اضافی (Trimming)
        var trimmedName = request.Name?.Trim() ?? string.Empty;
        var trimmedAge = request.Age?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            _logger.LogWarning("درخواست ثبت رکورد به دلیل خالی بودن فیلد نام رد شد.");
            throw new ArgumentException("فیلد نام نمی‌تواند خالی یا شامل صرفاً کاراکتر فاصله باشد.", nameof(request.Name));
        }

        if (trimmedName.Length > 10)
        {
            _logger.LogWarning("درخواست ثبت رکورد با نام طولانی رد شد. طول نام: {Length}", trimmedName.Length);
            throw new ArgumentException("طول نام نمی‌تواند بیش از ۱۰ کاراکتر باشد (محدودیت NCHAR(10)).", nameof(request.Name));
        }

        if (string.IsNullOrWhiteSpace(trimmedAge))
        {
            _logger.LogWarning("درخواست ثبت رکورد به دلیل خالی بودن فیلد سن رد شد.");
            throw new ArgumentException("فیلد سن نمی‌تواند خالی یا شامل صرفاً کاراکتر فاصله باشد.", nameof(request.Age));
        }

        if (trimmedAge.Length > 50)
        {
            _logger.LogWarning("درخواست ثبت رکورد با سن بیش از ۵۰ کاراکتر رد شد.");
            throw new ArgumentException("طول فیلد سن نمی‌تواند بیش از ۵۰ کاراکتر باشد.", nameof(request.Age));
        }

        _logger.LogInformation("در حال ارسال درخواست درج رکورد با نام {Name} به لایه ریپازیتوری...", trimmedName);

        var result = await _repository.InsertAsync(trimmedName, trimmedAge, cancellationToken);

        if (result)
        {
            _logger.LogInformation("رکورد با نام {Name} با موفقیت در پایگاه داده ثبت شد.", trimmedName);
        }
        else
        {
            _logger.LogWarning("ثبت رکورد با نام {Name} در پایگاه داده ناموفق بود.", trimmedName);
        }

        return result;
    }
}
