-- =========================================================================
-- MASTER SQL PROCEDURE DEFINITIONS FOR EXCEL & SOFTWARE PERFECT PARITY (HIGH PERFORMANCE)
-- =========================================================================

-- 1. sp_GetExcelTahmasbiReport
CREATE OR ALTER PROCEDURE dbo.sp_GetExcelTahmasbiReport
    @ReactorId INT = NULL,
    @BatchId INT = NULL,
    @BatchIds NVARCHAR(MAX) = NULL,
    @BatchNumbers NVARCHAR(MAX) = NULL,
    @Year INT = NULL,
    @Month INT = NULL,
    @FromDate DATETIME = NULL,
    @ToDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ActualReactorId INT = @ReactorId;
    IF @ReactorId = 3 SET @ActualReactorId = 1;
    IF @ReactorId = 4 SET @ActualReactorId = 2;

    DECLARE @StartDate DATETIME = @FromDate;
    DECLARE @EndDate DATETIME = @ToDate;

    IF @Year = 1404 AND @StartDate IS NULL SET @StartDate = '2025-03-21';
    IF @Year = 1404 AND @EndDate IS NULL SET @EndDate = '2026-03-20 23:59:59';
    IF @Year = 1405 AND @StartDate IS NULL SET @StartDate = '2026-03-21';
    IF @Year = 1405 AND @EndDate IS NULL SET @EndDate = '2027-03-20 23:59:59';

    IF OBJECT_ID('tempdb..#TahmasbiFiltered') IS NOT NULL DROP TABLE #TahmasbiFiltered;

    WITH BaseLogs AS (
        SELECT 
            l.Id,
            b.ReactorId,
            b.BatchId,
            b.BatchNum,
            l.BatchNumber,
            l.CreatedDate,
            ISNULL(l.OperatorManualDate, l.CreatedDate) AS EffectiveDate,
            ISNULL(l.AlcoholLiter, 0) AS AlcoholLiter,
            ISNULL(l.AlcoholDegree, 0) AS AlcoholDegree,
            ISNULL(l.AcidKg, 0) AS AcidKg,
            ISNULL(l.ProductSpeed, 0) AS ProductSpeed,
            ISNULL(l.ProductDegree, 0) AS ProductDegree,
            ISNULL(l.AGSpeed, 0) AS AGSpeed,
            l.OutputType,
            s.StopDurationMinutes,
            ISNULL(DATEDIFF(minute, LAG(l.CreatedDate) OVER (PARTITION BY b.ReactorId ORDER BY l.Id), l.CreatedDate), 60) AS IntervalMinutes
        FROM dbo.BatchProductionLog l
        INNER JOIN dbo.Batch b ON l.BatchId = b.BatchId
        LEFT JOIN dbo.BatchProductionStop s ON l.Id = s.ToLogId
        WHERE (@ActualReactorId IS NULL OR b.ReactorId = @ActualReactorId)
          AND (@BatchId IS NULL OR b.BatchId = @BatchId)
          AND (@StartDate IS NULL OR ISNULL(l.OperatorManualDate, l.CreatedDate) >= @StartDate)
          AND (@EndDate IS NULL OR ISNULL(l.OperatorManualDate, l.CreatedDate) <= @EndDate)
    ),
    WithFarsi AS (
        SELECT 
            *,
            dbo.FarsiDate(EffectiveDate) AS ShDate
        FROM BaseLogs
    )
    SELECT *
    INTO #TahmasbiFiltered
    FROM WithFarsi
    WHERE (@BatchIds IS NULL OR BatchId IN (SELECT CAST(TRIM(value) AS INT) FROM STRING_SPLIT(@BatchIds, ',') WHERE TRIM(value) <> ''))
      AND (@BatchNumbers IS NULL OR BatchNumber IN (SELECT TRIM(value) FROM STRING_SPLIT(@BatchNumbers, ',') WHERE TRIM(value) <> ''))
      AND (@Month IS NULL OR CAST(SUBSTRING(ShDate, 6, 2) AS INT) = @Month);

    SELECT
        ISNULL(SUM(AlcoholLiter), 0) AS TotalAlcoholLiter,
        CAST(CASE WHEN SUM(AlcoholLiter) > 0 
                  THEN SUM(AlcoholLiter * AlcoholDegree) / SUM(AlcoholLiter) 
                  ELSE 0 END AS DECIMAL(18,2)) AS AvgAlcoholDegree,
        ISNULL(SUM(AcidKg), 0) AS TotalAcidKg,

        -- آیزوتروپ خروجی (OutputType = 1 یعنی آیزوتروپ)
        ISNULL(SUM(CASE WHEN OutputType IS NULL OR OutputType = 1 THEN ProductSpeed ELSE 0 END), 0) AS TotalProductAmount,
        CAST(CASE WHEN SUM(CASE WHEN OutputType IS NULL OR OutputType = 1 THEN ProductSpeed ELSE 0 END) > 0 
                  THEN SUM(CASE WHEN OutputType IS NULL OR OutputType = 1 THEN ProductSpeed * ProductDegree ELSE 0 END) / 
                       SUM(CASE WHEN OutputType IS NULL OR OutputType = 1 THEN ProductSpeed ELSE 0 END)
                  ELSE 0 END AS DECIMAL(18,2)) AS AvgProductDegree,

        -- آب خارج شده از فرآیند
        ISNULL(SUM(AGSpeed), 0) AS TotalWaterAmount,

        -- محاسبات دقیق ساعات فرآیندی
        CAST(ISNULL(SUM(CASE WHEN StopDurationMinutes IS NULL AND AcidKg > 0 THEN IntervalMinutes ELSE 0 END) / 60.0, 0) AS DECIMAL(18,2)) AS AcidInjectHours,
        CAST(ISNULL(SUM(CASE WHEN StopDurationMinutes IS NULL AND AlcoholLiter > 0 THEN IntervalMinutes ELSE 0 END) / 60.0, 0) AS DECIMAL(18,2)) AS AlcoholInjectHours,
        CAST(ISNULL(SUM(CASE WHEN StopDurationMinutes IS NULL AND ProductSpeed > 0 AND (OutputType IS NULL OR OutputType = 1) THEN IntervalMinutes ELSE 0 END) / 60.0, 0) AS DECIMAL(18,2)) AS ProductHours,
        CAST(ISNULL(SUM(CASE WHEN StopDurationMinutes IS NULL AND AGSpeed > 0 THEN IntervalMinutes ELSE 0 END) / 60.0, 0) AS DECIMAL(18,2)) AS WaterDrainHours,

        -- ساعات خالص تولیدی و توقفات
        CAST(ISNULL(SUM(CASE WHEN StopDurationMinutes IS NULL THEN IntervalMinutes ELSE 0 END) / 60.0, 0) AS DECIMAL(18,2)) AS NetProductionHours,
        CAST(ISNULL(SUM(CASE WHEN StopDurationMinutes IS NOT NULL THEN StopDurationMinutes ELSE 0 END) / 60.0, 0) AS DECIMAL(18,2)) AS StopHours
    FROM #TahmasbiFiltered;

    DROP TABLE #TahmasbiFiltered;
END;
GO

-- 2. sp_GetExcelMonthlyProductionReport (Chart 2 اکسل)
CREATE OR ALTER PROCEDURE dbo.sp_GetExcelMonthlyProductionReport
    @ReactorId INT = NULL,
    @BatchId INT = NULL,
    @BatchIds NVARCHAR(MAX) = NULL,
    @BatchNumbers NVARCHAR(MAX) = NULL,
    @Year INT = NULL,
    @Month INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ActualReactorId INT = @ReactorId;
    IF @ReactorId = 3 SET @ActualReactorId = 1;
    IF @ReactorId = 4 SET @ActualReactorId = 2;

    DECLARE @StartDate DATETIME = NULL;
    DECLARE @EndDate DATETIME = NULL;
    IF @Year = 1404 BEGIN SET @StartDate = '2025-03-21'; SET @EndDate = '2026-03-20 23:59:59'; END;
    IF @Year = 1405 BEGIN SET @StartDate = '2026-03-21'; SET @EndDate = '2027-03-20 23:59:59'; END;

    ;WITH BaseLogs AS (
        SELECT 
            ISNULL(l.OperatorManualDate, l.CreatedDate) AS EffectiveDate,
            ISNULL(l.ProductSpeed, 0) AS ProductSpeed
        FROM dbo.BatchProductionLog l
        INNER JOIN dbo.Batch b ON l.BatchId = b.BatchId
        WHERE (@ActualReactorId IS NULL OR b.ReactorId = @ActualReactorId)
          AND (@BatchId IS NULL OR b.BatchId = @BatchId)
          AND (@BatchIds IS NULL OR b.BatchId IN (SELECT CAST(TRIM(value) AS INT) FROM STRING_SPLIT(@BatchIds, ',') WHERE TRIM(value) <> ''))
          AND (@BatchNumbers IS NULL OR l.BatchNumber IN (SELECT TRIM(value) FROM STRING_SPLIT(@BatchNumbers, ',') WHERE TRIM(value) <> ''))
          AND (@StartDate IS NULL OR ISNULL(l.OperatorManualDate, l.CreatedDate) >= @StartDate)
          AND (@EndDate IS NULL OR ISNULL(l.OperatorManualDate, l.CreatedDate) <= @EndDate)
          AND (l.OutputType IS NULL OR l.OutputType = 1)
          AND l.ProductSpeed > 0
    ),
    WithFarsi AS (
        SELECT 
            dbo.FarsiDate(EffectiveDate) AS ShDate,
            ProductSpeed
        FROM BaseLogs
    ),
    DailyAgg AS (
        SELECT 
            ShDate AS DateStr,
            SUM(ProductSpeed) AS DailyAmount
        FROM WithFarsi
        WHERE (@Month IS NULL OR CAST(SUBSTRING(ShDate, 6, 2) AS INT) = @Month)
        GROUP BY ShDate
    ),
    WithCumulative AS (
        SELECT 
            DateStr,
            DailyAmount,
            SUM(DailyAmount) OVER (ORDER BY DateStr ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS CumulativeAmount,
            SUM(DailyAmount) OVER () AS TotalMonthAmount
        FROM DailyAgg
    )
    SELECT 
        DateStr,
        DailyAmount,
        CumulativeAmount,
        CAST(CASE WHEN TotalMonthAmount > 0 THEN (DailyAmount * 100.0) / TotalMonthAmount ELSE 0 END AS DECIMAL(18,2)) AS SharePercent
    FROM WithCumulative
    ORDER BY DateStr ASC;
END;
GO

-- 3. sp_GetExcelQualityStabilityReport (Charts 3 & 4 اکسل)
CREATE OR ALTER PROCEDURE dbo.sp_GetExcelQualityStabilityReport
    @ReactorId INT = NULL,
    @BatchId INT = NULL,
    @BatchIds NVARCHAR(MAX) = NULL,
    @BatchNumbers NVARCHAR(MAX) = NULL,
    @Year INT = NULL,
    @Month INT = NULL,
    @FromDate DATETIME = NULL,
    @ToDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ActualReactorId INT = @ReactorId;
    IF @ReactorId = 3 SET @ActualReactorId = 1;
    IF @ReactorId = 4 SET @ActualReactorId = 2;

    DECLARE @StartDate DATETIME = @FromDate;
    DECLARE @EndDate DATETIME = @ToDate;
    IF @Year = 1404 AND @StartDate IS NULL SET @StartDate = '2025-03-21';
    IF @Year = 1404 AND @EndDate IS NULL SET @EndDate = '2026-03-20 23:59:59';
    IF @Year = 1405 AND @StartDate IS NULL SET @StartDate = '2026-03-21';
    IF @Year = 1405 AND @EndDate IS NULL SET @EndDate = '2027-03-20 23:59:59';

    ;WITH Brackets AS (
        SELECT 0 AS Code, N'کمتر از 75 درصد' AS RangeName
        UNION ALL
        SELECT 1, N'75 تا 80 درصد'
        UNION ALL
        SELECT 2, N'80 تا 85 درصد'
        UNION ALL
        SELECT 3, N'85 تا 90 درصد (کیفیت بالا)'
        UNION ALL
        SELECT 4, N'90 درصد و بالاتر (گرید استاندارد)'
    ),
    BaseLogs AS (
        SELECT 
            l.Id,
            b.ReactorId,
            b.BatchId,
            b.BatchNum,
            l.BatchNumber,
            l.CreatedDate,
            ISNULL(l.OperatorManualDate, l.CreatedDate) AS EffectiveDate,
            ISNULL(l.ProductSpeed, 0) AS ProductSpeed,
            ISNULL(l.ProductDegree, 0) AS ProductDegree,
            s.StopDurationMinutes,
            ISNULL(DATEDIFF(minute, LAG(l.CreatedDate) OVER (PARTITION BY b.ReactorId ORDER BY l.Id), l.CreatedDate), 60) AS IntervalMinutes
        FROM dbo.BatchProductionLog l
        INNER JOIN dbo.Batch b ON l.BatchId = b.BatchId
        LEFT JOIN dbo.BatchProductionStop s ON l.Id = s.ToLogId
        WHERE (@ActualReactorId IS NULL OR b.ReactorId = @ActualReactorId)
          AND (@BatchId IS NULL OR b.BatchId = @BatchId)
          AND (@StartDate IS NULL OR ISNULL(l.OperatorManualDate, l.CreatedDate) >= @StartDate)
          AND (@EndDate IS NULL OR ISNULL(l.OperatorManualDate, l.CreatedDate) <= @EndDate)
          AND (l.OutputType IS NULL OR l.OutputType = 1)
          AND l.ProductSpeed > 0
    ),
    WithFarsi AS (
        SELECT 
            *,
            dbo.FarsiDate(EffectiveDate) AS ShDate
        FROM BaseLogs
        WHERE (@BatchIds IS NULL OR BatchId IN (SELECT CAST(TRIM(value) AS INT) FROM STRING_SPLIT(@BatchIds, ',') WHERE TRIM(value) <> ''))
          AND (@BatchNumbers IS NULL OR BatchNumber IN (SELECT TRIM(value) FROM STRING_SPLIT(@BatchNumbers, ',') WHERE TRIM(value) <> ''))
    ),
    FilteredLogs AS (
        SELECT *
        FROM WithFarsi
        WHERE (@Month IS NULL OR CAST(SUBSTRING(ShDate, 6, 2) AS INT) = @Month)
    ),
    LogsAgg AS (
        SELECT 
            CASE 
                WHEN ProductDegree < 75 THEN 0
                WHEN ProductDegree >= 75 AND ProductDegree < 80 THEN 1
                WHEN ProductDegree >= 80 AND ProductDegree < 85 THEN 2
                WHEN ProductDegree >= 85 AND ProductDegree < 90 THEN 3
                ELSE 4
            END AS BracketCode,
            SUM(ProductSpeed) AS VolumeLiter,
            SUM(CASE WHEN StopDurationMinutes IS NULL THEN IntervalMinutes ELSE 0 END) / 60.0 AS BracketHours
        FROM FilteredLogs
        GROUP BY 
            CASE 
                WHEN ProductDegree < 75 THEN 0
                WHEN ProductDegree >= 75 AND ProductDegree < 80 THEN 1
                WHEN ProductDegree >= 80 AND ProductDegree < 85 THEN 2
                WHEN ProductDegree >= 85 AND ProductDegree < 90 THEN 3
                ELSE 4
            END
    ),
    TotalSum AS (
        SELECT 
            ISNULL(SUM(VolumeLiter), 0) AS TotalVol,
            ISNULL(SUM(BracketHours), 0) AS TotalHrs
        FROM LogsAgg
    )
    SELECT 
        b.Code,
        b.RangeName,
        ISNULL(la.VolumeLiter, 0) AS VolumeLiter,
        CAST(CASE WHEN ts.TotalVol > 0 THEN (ISNULL(la.VolumeLiter, 0) * 100.0) / ts.TotalVol ELSE 0 END AS DECIMAL(18,2)) AS VolumePercent,
        CAST(ISNULL(la.BracketHours, 0) AS DECIMAL(18,2)) AS Hours,
        CAST(CASE WHEN ts.TotalHrs > 0 THEN (ISNULL(la.BracketHours, 0) * 100.0) / ts.TotalHrs ELSE 0 END AS DECIMAL(18,2)) AS HoursPercent,
        CAST(CASE WHEN ISNULL(la.BracketHours, 0) > 0 THEN la.VolumeLiter / la.BracketHours ELSE 0 END AS DECIMAL(18,1)) AS RatePerHour
    FROM Brackets b
    CROSS JOIN TotalSum ts
    LEFT JOIN LogsAgg la ON b.Code = la.BracketCode
    ORDER BY b.Code;
END;
GO

-- 4. sp_GetExcelBreakdownReport (Charts 6, 7, 8, 9 اکسل)
CREATE OR ALTER PROCEDURE dbo.sp_GetExcelBreakdownReport
    @ReactorId INT = NULL,
    @BatchId INT = NULL,
    @BatchIds NVARCHAR(MAX) = NULL,
    @BatchNumbers NVARCHAR(MAX) = NULL,
    @Year INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ActualReactorId INT = @ReactorId;
    IF @ReactorId = 3 SET @ActualReactorId = 1;
    IF @ReactorId = 4 SET @ActualReactorId = 2;

    IF @Year IS NULL SET @Year = 1405;
    DECLARE @Offset INT = @Year - 1404;

    DECLARE @YearStart DATETIME = DATEADD(year, @Offset, '2025-03-21 00:00:00');
    DECLARE @YearEnd DATETIME = DATEADD(year, @Offset, '2026-03-20 23:59:59');

    DECLARE @M TABLE (MonthNumber INT, MonthName NVARCHAR(50), StartDate DATETIME, EndDate DATETIME);
    INSERT INTO @M VALUES 
    (1, N'فروردین', DATEADD(year, @Offset, '2025-03-21 00:00:00'), DATEADD(year, @Offset, '2025-04-20 23:59:59')),
    (2, N'اردیبهشت', DATEADD(year, @Offset, '2025-04-21 00:00:00'), DATEADD(year, @Offset, '2025-05-21 23:59:59')),
    (3, N'خرداد', DATEADD(year, @Offset, '2025-05-22 00:00:00'), DATEADD(year, @Offset, '2025-06-21 23:59:59')),
    (4, N'تیر', DATEADD(year, @Offset, '2025-06-22 00:00:00'), DATEADD(year, @Offset, '2025-07-22 23:59:59')),
    (5, N'مرداد', DATEADD(year, @Offset, '2025-07-23 00:00:00'), DATEADD(year, @Offset, '2025-08-22 23:59:59')),
    (6, N'شهریور', DATEADD(year, @Offset, '2025-08-23 00:00:00'), DATEADD(year, @Offset, '2025-09-22 23:59:59')),
    (7, N'مهر', DATEADD(year, @Offset, '2025-09-23 00:00:00'), DATEADD(year, @Offset, '2025-10-22 23:59:59')),
    (8, N'آبان', DATEADD(year, @Offset, '2025-10-23 00:00:00'), DATEADD(year, @Offset, '2025-11-21 23:59:59')),
    (9, N'آذر', DATEADD(year, @Offset, '2025-11-22 00:00:00'), DATEADD(year, @Offset, '2025-12-21 23:59:59')),
    (10, N'دی', DATEADD(year, @Offset, '2025-12-22 00:00:00'), DATEADD(year, @Offset, '2026-01-20 23:59:59')),
    (11, N'بهمن', DATEADD(year, @Offset, '2026-01-21 00:00:00'), DATEADD(year, @Offset, '2026-02-19 23:59:59')),
    (12, N'اسفند', DATEADD(year, @Offset, '2026-02-20 00:00:00'), DATEADD(year, @Offset, '2026-03-20 23:59:59'));

    IF OBJECT_ID('tempdb..#BreakdownFiltered') IS NOT NULL DROP TABLE #BreakdownFiltered;

    SELECT 
        l.Id,
        b.ReactorId,
        b.BatchId,
        b.BatchNum,
        l.BatchNumber,
        l.CreatedDate,
        ISNULL(l.OperatorManualDate, l.CreatedDate) AS EffectiveDate,
        s.Id AS StopId,
        s.StopDurationMinutes,
        s.BatchStopTypeId,
        s.BatchStopOccurrenceTypeId,
        ISNULL(DATEDIFF(minute, LAG(l.CreatedDate) OVER (PARTITION BY b.ReactorId ORDER BY l.Id), l.CreatedDate), 60) AS IntervalMinutes
    INTO #BreakdownFiltered
    FROM dbo.BatchProductionLog l
    INNER JOIN dbo.Batch b ON l.BatchId = b.BatchId
    LEFT JOIN dbo.BatchProductionStop s ON l.Id = s.ToLogId
    WHERE (@ActualReactorId IS NULL OR b.ReactorId = @ActualReactorId)
      AND (@BatchId IS NULL OR b.BatchId = @BatchId)
      AND (ISNULL(l.OperatorManualDate, l.CreatedDate) >= @YearStart)
      AND (ISNULL(l.OperatorManualDate, l.CreatedDate) <= @YearEnd)
      AND (@BatchIds IS NULL OR b.BatchId IN (SELECT CAST(TRIM(value) AS INT) FROM STRING_SPLIT(@BatchIds, ',') WHERE TRIM(value) <> ''))
      AND (@BatchNumbers IS NULL OR l.BatchNumber IN (SELECT TRIM(value) FROM STRING_SPLIT(@BatchNumbers, ',') WHERE TRIM(value) <> ''));

    -- 1. توقفات و تولید به تفکیک ۱۲ ماه شمسی سال (Chart 6 اکسل)
    SELECT 
        m.MonthNumber,
        m.MonthName,
        ISNULL(CAST(SUM(CASE WHEN f.StopDurationMinutes IS NULL THEN f.IntervalMinutes ELSE 0 END) / 60.0 AS DECIMAL(18,2)), 0) AS ProductionHours,
        ISNULL(CAST(SUM(CASE WHEN f.StopDurationMinutes IS NOT NULL THEN f.StopDurationMinutes ELSE 0 END) / 60.0 AS DECIMAL(18,2)), 0) AS StopHours
    FROM @M m
    LEFT JOIN #BreakdownFiltered f 
        ON f.EffectiveDate >= m.StartDate AND f.EffectiveDate <= m.EndDate
    GROUP BY m.MonthNumber, m.MonthName
    ORDER BY m.MonthNumber;

    -- 2. دلایل توقفات از روی جدول BatchStopOccurrenceType (Chart 9 اکسل)
    DECLARE @TotalStopMinutes DECIMAL(18,2);
    SELECT @TotalStopMinutes = NULLIF(SUM(StopDurationMinutes), 0) FROM #BreakdownFiltered WHERE StopDurationMinutes IS NOT NULL;

    SELECT 
        ISNULL(ot.Title, N'سایر علل') AS Reason,
        CAST(SUM(f.StopDurationMinutes) / 60.0 AS DECIMAL(18,2)) AS Hours,
        CAST(SUM(f.StopDurationMinutes) * 100.0 / ISNULL(@TotalStopMinutes, 1) AS DECIMAL(18,2)) AS [Percent]
    FROM #BreakdownFiltered f
    INNER JOIN dbo.BatchStopOccurrenceType ot ON f.BatchStopOccurrenceTypeId = ot.Id
    WHERE f.StopDurationMinutes IS NOT NULL
    GROUP BY ot.Title
    ORDER BY Hours DESC;

    -- 3. دوره وقوع توقف (حین تولید vs بین تولید) (Chart 4 اکسل)
    SELECT 
        CASE 
            WHEN st.Title = N'پایان بچ' THEN N'بین تولید'
            ELSE ISNULL(st.Title, N'بین تولید')
        END AS OccurrenceName,
        CAST(SUM(f.StopDurationMinutes) / 60.0 AS DECIMAL(18,2)) AS Hours,
        CAST(SUM(f.StopDurationMinutes) * 100.0 / ISNULL(@TotalStopMinutes, 1) AS DECIMAL(18,2)) AS [Percent]
    FROM #BreakdownFiltered f
    INNER JOIN dbo.BatchStopType st ON f.BatchStopTypeId = st.Id
    WHERE f.StopDurationMinutes IS NOT NULL
    GROUP BY st.Title
    ORDER BY Hours DESC;

    -- 4. شاخص‌های کلی تفکیکی (برای کارت‌های بالای تب Breakdown)
    SELECT
        CAST(ISNULL(SUM(CASE WHEN f.StopDurationMinutes IS NULL THEN f.IntervalMinutes ELSE 0 END) / 60.0, 0) AS DECIMAL(18,2)) AS ProductionHours,
        CAST(ISNULL(SUM(CASE WHEN f.StopDurationMinutes IS NOT NULL THEN f.StopDurationMinutes ELSE 0 END) / 60.0, 0) AS DECIMAL(18,2)) AS TotalStopHours,
        CAST(ISNULL(SUM(CASE WHEN f.BatchStopTypeId = 1 THEN f.StopDurationMinutes ELSE 0 END) / 60.0, 0) AS DECIMAL(18,2)) AS InProcessStopHours,
        CAST(ISNULL(SUM(CASE WHEN f.BatchStopTypeId = 2 THEN f.StopDurationMinutes ELSE 0 END) / 60.0, 0) AS DECIMAL(18,2)) AS StandbyStopHours
    FROM #BreakdownFiltered f;

    DROP TABLE #BreakdownFiltered;
END;
GO

-- 5. sp_GetExcelReactorComparisonReport (Chart 1 اکسل: شیت tolid)
CREATE OR ALTER PROCEDURE dbo.sp_GetExcelReactorComparisonReport
    @Year INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Year IS NULL SET @Year = 1405;
    DECLARE @Offset INT = @Year - 1404;

    DECLARE @M TABLE (MonthNumber INT, MonthName NVARCHAR(50), StartDate DATETIME, EndDate DATETIME);
    INSERT INTO @M VALUES 
    (1, N'فروردین', DATEADD(year, @Offset, '2025-03-21 00:00:00'), DATEADD(year, @Offset, '2025-04-20 23:59:59')),
    (2, N'اردیبهشت', DATEADD(year, @Offset, '2025-04-21 00:00:00'), DATEADD(year, @Offset, '2025-05-21 23:59:59')),
    (3, N'خرداد', DATEADD(year, @Offset, '2025-05-22 00:00:00'), DATEADD(year, @Offset, '2025-06-21 23:59:59')),
    (4, N'تیر', DATEADD(year, @Offset, '2025-06-22 00:00:00'), DATEADD(year, @Offset, '2025-07-22 23:59:59')),
    (5, N'مرداد', DATEADD(year, @Offset, '2025-07-23 00:00:00'), DATEADD(year, @Offset, '2025-08-22 23:59:59')),
    (6, N'شهریور', DATEADD(year, @Offset, '2025-08-23 00:00:00'), DATEADD(year, @Offset, '2025-09-22 23:59:59')),
    (7, N'مهر', DATEADD(year, @Offset, '2025-09-23 00:00:00'), DATEADD(year, @Offset, '2025-10-22 23:59:59')),
    (8, N'آبان', DATEADD(year, @Offset, '2025-10-23 00:00:00'), DATEADD(year, @Offset, '2025-11-21 23:59:59')),
    (9, N'آذر', DATEADD(year, @Offset, '2025-11-22 00:00:00'), DATEADD(year, @Offset, '2025-12-21 23:59:59')),
    (10, N'دی', DATEADD(year, @Offset, '2025-12-22 00:00:00'), DATEADD(year, @Offset, '2026-01-20 23:59:59')),
    (11, N'بهمن', DATEADD(year, @Offset, '2026-01-21 00:00:00'), DATEADD(year, @Offset, '2026-02-19 23:59:59')),
    (12, N'اسفند', DATEADD(year, @Offset, '2026-02-20 00:00:00'), DATEADD(year, @Offset, '2026-03-20 23:59:59'));

    SELECT 
        m.MonthNumber,
        m.MonthName,
        ISNULL(SUM(CASE WHEN b.ReactorId = 1 THEN l.ProductSpeed ELSE 0 END), 0) AS Reactor3,
        ISNULL(SUM(CASE WHEN b.ReactorId = 2 THEN l.ProductSpeed ELSE 0 END), 0) AS Reactor4,
        ISNULL(SUM(CASE WHEN b.ReactorId NOT IN (1, 2) THEN l.ProductSpeed ELSE 0 END), 0) AS Reactor36,
        ISNULL(SUM(l.ProductSpeed), 0) AS Total
    FROM @M m
    LEFT JOIN dbo.BatchProductionLog l 
        ON ISNULL(l.OperatorManualDate, l.CreatedDate) >= m.StartDate 
       AND ISNULL(l.OperatorManualDate, l.CreatedDate) <= m.EndDate
       AND (l.OutputType IS NULL OR l.OutputType = 1)
       AND l.ProductSpeed > 0
    LEFT JOIN dbo.Batch b ON l.BatchId = b.BatchId
    GROUP BY m.MonthNumber, m.MonthName
    ORDER BY m.MonthNumber;
END;
GO

-- 6. sp_GetExcelMassBalanceReport (موازنه جرم واقعی)
CREATE OR ALTER PROCEDURE dbo.sp_GetExcelMassBalanceReport
    @ReactorId INT = NULL,
    @BatchId INT = NULL,
    @Year INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ActualReactorId INT = @ReactorId;
    IF @ReactorId = 3 SET @ActualReactorId = 1;
    IF @ReactorId = 4 SET @ActualReactorId = 2;

    DECLARE @StartDate DATETIME = NULL;
    DECLARE @EndDate DATETIME = NULL;
    IF @Year = 1404 BEGIN SET @StartDate = '2025-03-21'; SET @EndDate = '2026-03-20 23:59:59'; END;
    IF @Year = 1405 BEGIN SET @StartDate = '2026-03-21'; SET @EndDate = '2027-03-20 23:59:59'; END;

    ;WITH FilteredLogs AS (
        SELECT 
            ISNULL(l.AlcoholLiter, 0) AS AlcoholLiter,
            ISNULL(l.AlcoholDegree, 0) AS AlcoholDegree,
            ISNULL(l.AcidKg, 0) AS AcidKg,
            ISNULL(l.ProductSpeed, 0) AS ProductSpeed,
            ISNULL(l.ProductDegree, 0) AS ProductDegree,
            ISNULL(l.AGSpeed, 0) AS AGSpeed,
            ISNULL(l.Ethanol_Liter, 0) AS Ethanol_Liter,
            ISNULL(l.Acid_Liter, 0) AS Acid_Liter,
            ISNULL(l.EthylAcetate_Liter, 0) AS EthylAcetate_Liter,
            ISNULL(l.Water_Liter, 0) AS Water_Liter
        FROM dbo.BatchProductionLog l
        INNER JOIN dbo.Batch b ON l.BatchId = b.BatchId
        WHERE (@ActualReactorId IS NULL OR b.ReactorId = @ActualReactorId)
          AND (@BatchId IS NULL OR b.BatchId = @BatchId)
          AND (@StartDate IS NULL OR ISNULL(l.OperatorManualDate, l.CreatedDate) >= @StartDate)
          AND (@EndDate IS NULL OR ISNULL(l.OperatorManualDate, l.CreatedDate) <= @EndDate)
    )
    SELECT
        N'الکل اتیلیک (Ethanol)' AS Component,
        ISNULL(SUM(AlcoholLiter), 0) AS InputLiter,
        ISNULL(SUM(CASE WHEN ProductSpeed > 0 THEN ProductSpeed * (100.0 - ProductDegree) / 100.0 ELSE 0 END), 0) AS OutputLiter,
        ISNULL(SUM(Ethanol_Liter), 0) AS RemainingLiter,
        CAST(ISNULL(SUM(AlcoholLiter) * 0.789, 0) AS DECIMAL(18,2)) AS TheoreticalKg,
        CAST(ISNULL(SUM(AlcoholLiter) - (SUM(CASE WHEN ProductSpeed > 0 THEN ProductSpeed * (100.0 - ProductDegree) / 100.0 ELSE 0 END) + SUM(Ethanol_Liter)), 0) AS DECIMAL(18,2)) AS DeviationLiter
    FROM FilteredLogs

    UNION ALL

    SELECT
        N'اسید استیک (Acetic Acid)',
        ISNULL(SUM(AcidKg), 0),
        ISNULL(SUM(Acid_Liter), 0),
        CAST(ISNULL(SUM(AcidKg) * 0.05, 0) AS DECIMAL(18,2)),
        CAST(ISNULL(SUM(AcidKg) * 1.05, 0) AS DECIMAL(18,2)),
        CAST(ISNULL(SUM(AcidKg) - (SUM(Acid_Liter) + (SUM(AcidKg) * 0.05)), 0) AS DECIMAL(18,2))
    FROM FilteredLogs

    UNION ALL

    SELECT
        N'اتیل استات نهایی (Ethyl Acetate)',
        0,
        ISNULL(SUM(ProductSpeed), 0),
        ISNULL(SUM(EthylAcetate_Liter), 0),
        CAST(ISNULL(SUM(ProductSpeed) * 0.902, 0) AS DECIMAL(18,2)),
        CAST(ISNULL(SUM(ProductSpeed) - SUM(EthylAcetate_Liter), 0) AS DECIMAL(18,2))
    FROM FilteredLogs

    UNION ALL

    SELECT
        N'آب واکنش و فرآیندی (Water)',
        0,
        ISNULL(SUM(AGSpeed), 0),
        ISNULL(SUM(Water_Liter), 0),
        CAST(ISNULL(SUM(AGSpeed) * 1.0, 0) AS DECIMAL(18,2)),
        CAST(ISNULL(SUM(AGSpeed) - SUM(Water_Liter), 0) AS DECIMAL(18,2))
    FROM FilteredLogs;
END;
GO
