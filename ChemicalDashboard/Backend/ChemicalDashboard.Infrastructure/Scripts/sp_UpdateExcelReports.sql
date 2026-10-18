-- =========================================================================
-- 1. sp_GetExcelTahmasbiReport: گزارش خلاصه وضعیت تولید و راندمان‌ها مطابق دقیق اکسل
-- =========================================================================
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

    IF OBJECT_ID('tempdb..#TahmasbiFiltered') IS NOT NULL DROP TABLE #TahmasbiFiltered;

    WITH LogIntervals AS (
        SELECT 
            l.Id,
            b.ReactorId,
            b.BatchId,
            b.BatchNum,
            l.BatchNumber,
            l.CreatedDate,
            l.OperatorManualDate,
            dbo.FarsiDate(l.OperatorManualDate) AS ShDate,
            CAST(SUBSTRING(dbo.FarsiDate(l.OperatorManualDate), 1, 4) AS INT) AS ShYear,
            CAST(SUBSTRING(dbo.FarsiDate(l.OperatorManualDate), 6, 2) AS INT) AS ShMonth,
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
    )
    SELECT *
    INTO #TahmasbiFiltered
    FROM LogIntervals
    WHERE (@BatchId IS NULL OR BatchId = @BatchId)
      AND (@BatchIds IS NULL OR BatchId IN (SELECT CAST(TRIM(value) AS INT) FROM STRING_SPLIT(@BatchIds, ',') WHERE TRIM(value) <> ''))
      AND (@BatchNumbers IS NULL OR BatchNumber IN (SELECT TRIM(value) FROM STRING_SPLIT(@BatchNumbers, ',') WHERE TRIM(value) <> ''))
      AND (@Year IS NULL OR ShYear = @Year)
      AND (@Month IS NULL OR ShMonth = @Month)
      AND (@FromDate IS NULL OR ISNULL(OperatorManualDate, CreatedDate) >= @FromDate)
      AND (@ToDate IS NULL OR ISNULL(OperatorManualDate, CreatedDate) <= @ToDate);

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

-- =========================================================================
-- 2. sp_GetExcelBreakdownReport: توقفات، علل و قابلیت اطمینان (Charts 6 & 9)
-- =========================================================================
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

    IF OBJECT_ID('tempdb..#BreakdownFiltered') IS NOT NULL DROP TABLE #BreakdownFiltered;

    WITH LogIntervals AS (
        SELECT 
            l.Id,
            b.ReactorId,
            b.BatchId,
            b.BatchNum,
            l.BatchNumber,
            l.CreatedDate,
            l.OperatorManualDate,
            dbo.FarsiDate(l.OperatorManualDate) AS ShDate,
            CAST(SUBSTRING(dbo.FarsiDate(l.OperatorManualDate), 1, 4) AS INT) AS ShYear,
            CAST(SUBSTRING(dbo.FarsiDate(l.OperatorManualDate), 6, 2) AS INT) AS ShMonth,
            s.Id AS StopId,
            s.StopDurationMinutes,
            s.BatchStopTypeId,
            s.BatchStopOccurrenceTypeId,
            ISNULL(DATEDIFF(minute, LAG(l.CreatedDate) OVER (PARTITION BY b.ReactorId ORDER BY l.Id), l.CreatedDate), 60) AS IntervalMinutes
        FROM dbo.BatchProductionLog l
        INNER JOIN dbo.Batch b ON l.BatchId = b.BatchId
        LEFT JOIN dbo.BatchProductionStop s ON l.Id = s.ToLogId
        WHERE (@ActualReactorId IS NULL OR b.ReactorId = @ActualReactorId)
    )
    SELECT *
    INTO #BreakdownFiltered
    FROM LogIntervals
    WHERE (@BatchId IS NULL OR BatchId = @BatchId)
      AND (@BatchIds IS NULL OR BatchId IN (SELECT CAST(TRIM(value) AS INT) FROM STRING_SPLIT(@BatchIds, ',') WHERE TRIM(value) <> ''))
      AND (@BatchNumbers IS NULL OR BatchNumber IN (SELECT TRIM(value) FROM STRING_SPLIT(@BatchNumbers, ',') WHERE TRIM(value) <> ''))
      AND (@Year IS NULL OR ShYear = @Year);

    -- جدول ۱۲ ماه سال شمسی
    DECLARE @AllMonths TABLE (MonthNumber INT, MonthName NVARCHAR(50));
    INSERT INTO @AllMonths VALUES 
    (1, N'فروردین'), (2, N'اردیبهشت'), (3, N'خرداد'), 
    (4, N'تیر'), (5, N'مرداد'), (6, N'شهریور'), 
    (7, N'مهر'), (8, N'آبان'), (9, N'آذر'), 
    (10, N'دی'), (11, N'بهمن'), (12, N'اسفند');

    -- 1. توقفات و تولید به تفکیک ۱۲ ماه شمسی سال (Chart 6 اکسل)
    SELECT 
        m.MonthNumber,
        m.MonthName,
        ISNULL(CAST(SUM(CASE WHEN f.StopDurationMinutes IS NULL THEN f.IntervalMinutes ELSE 0 END) / 60.0 AS DECIMAL(18,2)), 0) AS ProductionHours,
        ISNULL(CAST(SUM(CASE WHEN f.StopDurationMinutes IS NOT NULL THEN f.StopDurationMinutes ELSE 0 END) / 60.0 AS DECIMAL(18,2)), 0) AS StopHours
    FROM @AllMonths m
    LEFT JOIN #BreakdownFiltered f ON m.MonthNumber = f.ShMonth
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
