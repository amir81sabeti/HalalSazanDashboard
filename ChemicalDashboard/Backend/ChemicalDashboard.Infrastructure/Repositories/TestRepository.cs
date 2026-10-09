using System.Data;
using ChemicalDashboard.Application.Interfaces.Data;
using ChemicalDashboard.Application.Interfaces.Repositories;
using ChemicalDashboard.Contracts.Test;
using Dapper;
using Microsoft.Extensions.Logging;

namespace ChemicalDashboard.Infrastructure.Repositories;

/// <summary>
/// پیاده‌سازی ریپازیتوری تستی با استفاده از Dapper و منحصراً از طریق Stored Procedure
/// طبق الزامات معماری، هیچ‌گونه کوئری متنی مستقیم (Inline SQL) یا فریم‌ورک EF در این کلاس استفاده نمی‌شود
/// </summary>
public sealed class TestRepository : ITestRepository
{
    private const string SpSelectTest = "dbo.sp_SelectTest";
    private const string SpInsertTest = "dbo.sp_InsertTest";

    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<TestRepository> _logger;

    /// <summary>
    /// سازنده ریپازیتوری با تزریق کارخانه اتصال و ابزار ثبت لاگ
    /// </summary>
    public TestRepository(IDbConnectionFactory connectionFactory, ILogger<TestRepository> logger)
    {
        _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// فراخوانی استورد پروسیجر dbo.sp_SelectTest جهت بازیابی رکوردها
    /// اجرای دستور با CommandType.StoredProcedure و اتصال کوتاه‌مدت (Short-lived)
    /// </summary>
    public async Task<IReadOnlyList<TestRecordResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("در حال اجرای پروسیجر {ProcedureName} با استفاده از Dapper...", SpSelectTest);

        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var command = new CommandDefinition(
            commandText: SpSelectTest,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        // اجرای پروسیجر و خواندن رکوردها
        var rows = await connection.QueryAsync<TestRecordDbModel>(command);

        // تبدیل مدل خام دیتابیس به DTO قرارداد لایه بیرونی و حذف فاصله‌های پرشده بر اثر NCHAR(10)
        var result = rows.Select(r => new TestRecordResponseDto
        {
            Id = r.id,
            Name = r.Name?.Trim(),
            Age = r.Age?.Trim()
        }).ToList();

        _logger.LogInformation("پروسیجر {ProcedureName} با موفقیت اجرا شد. تعداد رکوردهای بازیابی‌شده: {Count}", SpSelectTest, result.Count);

        return result;
    }

    /// <summary>
    /// فراخوانی استورد پروسیجر dbo.sp_InsertTest جهت ثبت یک رکورد جدید
    /// پارامترها با نوع داده صریح متناظر با تعاریف دیتابیس ارسال می‌شوند
    /// </summary>
    public async Task<bool> InsertAsync(string name, string age, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("در حال اجرای پروسیجر {ProcedureName} برای درج نام {Name}...", SpInsertTest, name);

        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        // تعریف ایمن پارامترهای ارسالی به پروسیجر جهت جلوگیری از هرگونه SQL Injection
        // با توجه به تعریف پروسیجر: @Name NCHAR(10), @Age NVARCHAR(50)
        var parameters = new DynamicParameters();
        parameters.Add("@Name", name, DbType.StringFixedLength, size: 10);
        parameters.Add("@Age", age, DbType.String, size: 50);

        var command = new CommandDefinition(
            commandText: SpInsertTest,
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        var rowsAffected = await connection.ExecuteAsync(command);

        _logger.LogInformation("پروسیجر {ProcedureName} اجرا شد. تعداد ردیف‌های متأثر: {RowsAffected}", SpInsertTest, rowsAffected);

        // در صورت اجرای موفقیت‌آمیز، عملیات موفق ارزیابی می‌شود
        return true;
    }

    /// <summary>
    /// مدل داخلی نگاشت مستقیم ستون‌های پروسیجر dbo.sp_SelectTest
    /// این کلاس داخلی و کاملاً ایزوله در لایه زیرساخت است
    /// </summary>
    private sealed class TestRecordDbModel
    {
        public int id { get; set; }
        public string? Name { get; set; }
        public string? Age { get; set; }
    }
}
