using System.Data;
using ChemicalDashboard.Application.Interfaces.Data;
using ChemicalDashboard.Application.Interfaces.Repositories;
using ChemicalDashboard.Contracts.ExcelReport;
using Dapper;
using Microsoft.Extensions.Logging;

namespace ChemicalDashboard.Infrastructure.Repositories;

public sealed class ExcelReportRepository : IExcelReportRepository
{
    private const string SpTahmasbi = "dbo.sp_GetExcelTahmasbiReport";
    private const string SpMonthly = "dbo.sp_GetExcelMonthlyProductionReport";
    private const string SpQuality = "dbo.sp_GetExcelQualityStabilityReport";
    private const string SpBreakdown = "dbo.sp_GetExcelBreakdownReport";
    private const string SpReactors = "dbo.sp_GetExcelReactorComparisonReport";
    private const string SpMassBalance = "dbo.sp_GetExcelMassBalanceReport";
    private const string SpRawLogs = "dbo.sp_GetExcelRawLogs";

    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<ExcelReportRepository> _logger;

    public ExcelReportRepository(IDbConnectionFactory connectionFactory, ILogger<ExcelReportRepository> logger)
    {
        _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ExcelTahmasbiSummaryDto> GetTahmasbiReportAsync(
        int? reactorId, int? batchId, string? batchIds, string? batchNumbers, int? year, int? month, DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {Sp} با فیلترها: ReactorId={ReactorId}, BatchId={BatchId}, BatchNumbers={BatchNumbers}, Year={Year}", SpTahmasbi, reactorId, batchId, batchNumbers, year);
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@ReactorId", reactorId, DbType.Int32);
        parameters.Add("@BatchId", batchId, DbType.Int32);
        parameters.Add("@BatchIds", batchIds, DbType.String);
        parameters.Add("@BatchNumbers", batchNumbers, DbType.String);
        parameters.Add("@Year", year, DbType.Int32);
        parameters.Add("@Month", month, DbType.Int32);
        parameters.Add("@FromDate", fromDate, DbType.DateTime);
        parameters.Add("@ToDate", toDate, DbType.DateTime);

        var command = new CommandDefinition(SpTahmasbi, parameters, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken);
        var result = await connection.QueryFirstOrDefaultAsync<ExcelTahmasbiSummaryDto>(command);

        return result ?? new ExcelTahmasbiSummaryDto();
    }

    public async Task<IReadOnlyList<ExcelMonthlyProductionItemDto>> GetMonthlyProductionReportAsync(
        int? reactorId, int? batchId, int? year, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {Sp} با فیلترها: ReactorId={ReactorId}, BatchId={BatchId}, Year={Year}", SpMonthly, reactorId, batchId, year);
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@ReactorId", reactorId, DbType.Int32);
        parameters.Add("@BatchId", batchId, DbType.Int32);
        parameters.Add("@Year", year, DbType.Int32);

        var command = new CommandDefinition(SpMonthly, parameters, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken);
        var rows = await connection.QueryAsync<ExcelMonthlyProductionItemDto>(command);

        return rows.ToList();
    }

    public async Task<IReadOnlyList<ExcelQualityStabilityItemDto>> GetQualityStabilityReportAsync(
        int? reactorId, int? batchId, DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {Sp} با فیلترها: ReactorId={ReactorId}, BatchId={BatchId}", SpQuality, reactorId, batchId);
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@ReactorId", reactorId, DbType.Int32);
        parameters.Add("@BatchId", batchId, DbType.Int32);
        parameters.Add("@FromDate", fromDate, DbType.DateTime);
        parameters.Add("@ToDate", toDate, DbType.DateTime);

        var command = new CommandDefinition(SpQuality, parameters, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken);
        var rows = await connection.QueryAsync<ExcelQualityStabilityItemDto>(command);

        return rows.ToList();
    }

    public async Task<ExcelBreakdownReportDto> GetBreakdownReportAsync(
        int? reactorId, int? batchId, string? batchIds, string? batchNumbers, int? year, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {Sp} با فیلترها: ReactorId={ReactorId}, BatchId={BatchId}, Year={Year}", SpBreakdown, reactorId, batchId, year);
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@ReactorId", reactorId, DbType.Int32);
        parameters.Add("@BatchId", batchId, DbType.Int32);
        parameters.Add("@BatchIds", batchIds, DbType.String);
        parameters.Add("@BatchNumbers", batchNumbers, DbType.String);
        parameters.Add("@Year", year, DbType.Int32);

        var command = new CommandDefinition(SpBreakdown, parameters, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken);
        using var multi = await connection.QueryMultipleAsync(command);

        var monthly = (await multi.ReadAsync<ExcelBreakdownMonthDto>()).ToList();
        var reasons = (await multi.ReadAsync<ExcelStopReasonDto>()).ToList();
        var occurrences = (await multi.ReadAsync<ExcelStopOccurrenceDto>()).ToList();
        var kpis = await multi.ReadFirstOrDefaultAsync<ExcelBreakdownKpiDto>();

        return new ExcelBreakdownReportDto
        {
            MonthlyBreakdown = monthly,
            StopReasons = reasons,
            OccurrenceTypes = occurrences,
            ProductionHours = kpis?.ProductionHours ?? 0m,
            TotalStopHours = kpis?.TotalStopHours ?? 0m,
            InProcessStopHours = kpis?.InProcessStopHours ?? 0m,
            StandbyStopHours = kpis?.StandbyStopHours ?? 0m
        };
    }

    public async Task<IReadOnlyList<ExcelReactorComparisonDto>> GetReactorComparisonReportAsync(
        int? year, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {Sp} با سال: {Year}", SpReactors, year);
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@Year", year, DbType.Int32);

        var command = new CommandDefinition(SpReactors, parameters, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken);
        var rows = await connection.QueryAsync<ExcelReactorComparisonDto>(command);

        return rows.ToList();
    }

    public async Task<IReadOnlyList<ExcelMassBalanceItemDto>> GetMassBalanceReportAsync(
        int? reactorId, int? batchId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {Sp} با فیلترها: ReactorId={ReactorId}, BatchId={BatchId}", SpMassBalance, reactorId, batchId);
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@ReactorId", reactorId, DbType.Int32);
        parameters.Add("@BatchId", batchId, DbType.Int32);

        var command = new CommandDefinition(SpMassBalance, parameters, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken);
        var rows = await connection.QueryAsync<ExcelMassBalanceItemDto>(command);

        return rows.ToList();
    }

    public async Task<ExcelRawLogsPagedResultDto> GetRawLogsAsync(
        int? reactorId, int? batchId, string? search, int pageIndex, int pageSize, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("اجرای پروسیجر {Sp} با فیلترها: PageIndex={PageIndex}, PageSize={PageSize}", SpRawLogs, pageIndex, pageSize);
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("@ReactorId", reactorId, DbType.Int32);
        parameters.Add("@BatchId", batchId, DbType.Int32);
        parameters.Add("@Search", search, DbType.String);
        parameters.Add("@PageIndex", pageIndex, DbType.Int32);
        parameters.Add("@PageSize", pageSize, DbType.Int32);

        var command = new CommandDefinition(SpRawLogs, parameters, commandType: CommandType.StoredProcedure, cancellationToken: cancellationToken);
        using var multi = await connection.QueryMultipleAsync(command);

        int totalCount = await multi.ReadFirstOrDefaultAsync<int>();
        var items = (await multi.ReadAsync<ExcelRawLogItemDto>()).ToList();

        return new ExcelRawLogsPagedResultDto
        {
            TotalCount = totalCount,
            PageIndex = pageIndex,
            PageSize = pageSize,
            Items = items
        };
    }
}
