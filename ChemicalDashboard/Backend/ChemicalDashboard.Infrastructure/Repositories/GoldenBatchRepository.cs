using System.Data;
using ChemicalDashboard.Application.Interfaces.Data;
using ChemicalDashboard.Application.Interfaces.Repositories;
using ChemicalDashboard.Contracts.GoldenBatch;
using Dapper;
using Microsoft.Extensions.Logging;

namespace ChemicalDashboard.Infrastructure.Repositories;

/// <summary>
/// پیاده‌سازی ریپازیتوری استخراج داده‌های بچ طلایی با Dapper و Stored Procedure
/// </summary>
public sealed class GoldenBatchRepository : IGoldenBatchRepository
{
    private const string SpName = "dbo.sp_GetGoldenBatchAnalytics";

    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<GoldenBatchRepository> _logger;

    public GoldenBatchRepository(IDbConnectionFactory connectionFactory, ILogger<GoldenBatchRepository> logger)
    {
        _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<GoldenBatchDashboardResponseDto> GetGoldenBatchAnalyticsAsync(
        int? reactorId,
        DateTime? fromDate,
        DateTime? toDate,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {Sp} با پارامترها: ReactorId={ReactorId}", SpName, reactorId);

        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@ReactorId", reactorId, DbType.Int32);
        parameters.Add("@FromDate", fromDate, DbType.DateTime);
        parameters.Add("@ToDate", toDate, DbType.DateTime);

        var command = new CommandDefinition(
            commandText: SpName,
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        using var multi = await connection.QueryMultipleAsync(command);

        var batches = (await multi.ReadAsync<BatchPerformanceItemDto>()).ToList();
        var summary = await multi.ReadFirstOrDefaultAsync<GoldenBatchExecutiveSummaryDto>() ?? new GoldenBatchExecutiveSummaryDto();
        var downtimes = (await multi.ReadAsync<GoldenBatchDowntimeItemDto>()).ToList();
        var radar = await multi.ReadFirstOrDefaultAsync<GoldenBatchRadarComparisonDto>() ?? new GoldenBatchRadarComparisonDto();

        return new GoldenBatchDashboardResponseDto
        {
            Summary = summary,
            Batches = batches,
            DowntimeBreakdown = downtimes,
            RadarBaseline = radar
        };
    }
}
