using System.Data;
using ChemicalDashboard.Application.Interfaces.Data;
using ChemicalDashboard.Application.Interfaces.Repositories;
using ChemicalDashboard.Contracts.Chart;
using Dapper;
using Microsoft.Extensions.Logging;

namespace ChemicalDashboard.Infrastructure.Repositories;

/// <summary>
/// پیاده‌سازی ریپازیتوری دسترسی به داده‌های نمودارهای فرآیند از طریق استورد پروسیجرهای بهینه
/// </summary>
public sealed class ProcessChartRepository : IProcessChartRepository
{
    private const string SpGetBatchesForFilter = "dbo.sp_GetBatchesForFilter";
    private const string SpGetDynamicChartData = "dbo.sp_GetDynamicChartData";

    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<ProcessChartRepository> _logger;

    public ProcessChartRepository(IDbConnectionFactory connectionFactory, ILogger<ProcessChartRepository> logger)
    {
        _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<IReadOnlyList<BatchFilterItemDto>> GetBatchesForFilterAsync(int? reactorId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {ProcedureName} با راکتور: {ReactorId}", SpGetBatchesForFilter, reactorId);

        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@ReactorId", reactorId, DbType.Int32);

        var command = new CommandDefinition(
            commandText: SpGetBatchesForFilter,
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        var rows = await connection.QueryAsync<BatchFilterItemDto>(command);
        return rows.ToList();
    }

    public async Task<IReadOnlyList<ProcessChartPointDto>> GetChartDataAsync(
        int? reactorId,
        int? batchId,
        DateTime? fromDate,
        DateTime? toDate,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {ProcedureName} با فیلترها: ReactorId={ReactorId}, BatchId={BatchId}",
            SpGetDynamicChartData, reactorId, batchId);

        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@ReactorId", reactorId, DbType.Int32);
        parameters.Add("@BatchId", batchId, DbType.Int32);
        parameters.Add("@FromDate", fromDate, DbType.DateTime);
        parameters.Add("@ToDate", toDate, DbType.DateTime);

        var command = new CommandDefinition(
            commandText: SpGetDynamicChartData,
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        var rows = await connection.QueryAsync<ProcessChartPointDto>(command);
        return rows.ToList();
    }
}
