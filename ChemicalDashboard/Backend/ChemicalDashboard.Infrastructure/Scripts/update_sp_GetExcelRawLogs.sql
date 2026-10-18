-- =========================================================================
-- به‌روزرسانی sp_GetExcelRawLogs با تطبیق ۱۰۰٪ فیلدهای BatchProductionLog
-- مطابق با ساختار جدول Entry.aspx و پایگاه داده حلال سازان
-- =========================================================================
USE HalalSazan;
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetExcelRawLogs
    @ReactorId INT = NULL,
    @BatchId INT = NULL,
    @Search NVARCHAR(100) = NULL,
    @PageIndex INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@PageIndex - 1) * @PageSize;

    -- شمارش کل رکوردها
    SELECT COUNT(l.Id) AS TotalCount
    FROM dbo.BatchProductionLog l
    INNER JOIN dbo.Batch b ON l.BatchId = b.BatchId
    WHERE (@ReactorId IS NULL OR b.ReactorId = @ReactorId)
      AND (@BatchId IS NULL OR l.BatchId = @BatchId)
      AND (@Search IS NULL OR @Search = '' 
           OR l.Description LIKE '%' + @Search + '%' 
           OR CAST(b.BatchNum AS NVARCHAR(20)) LIKE '%' + @Search + '%');

    -- ردیف‌های صفحه فعلی با نام‌های دقیق و استاندارد دیتابیس و کدهای Entry.aspx
    SELECT 
        l.Id,
        b.BatchId,
        b.BatchNum,
        CASE WHEN b.ReactorId = 1 THEN 3 WHEN b.ReactorId = 2 THEN 4 ELSE 36 END AS ReactorNum,
        ISNULL(dbo.FarsiDate(ISNULL(l.OperatorManualDate, l.CreatedDate)), CONVERT(VARCHAR(10), ISNULL(l.OperatorManualDate, l.CreatedDate), 111)) AS OperatorManualDateFA,
        ISNULL(dbo.FarsiDate(ISNULL(l.OperatorManualDate, l.CreatedDate)), CONVERT(VARCHAR(10), ISNULL(l.OperatorManualDate, l.CreatedDate), 111)) AS DateStr,
        CONVERT(VARCHAR(5), l.InspectionTime, 108) AS InspectionTime,
        
        -- الکل ورودی
        ISNULL(l.AlcoholLiter, 0) AS AlcoholLiter,
        ISNULL(l.AlcoholLiter, 0) AS AlcoholIn,
        ISNULL(l.AlcoholDegree, 0) AS AlcoholDegree,
        ISNULL(l.AlcoholDegree, 0) AS AlcoholDeg,
        
        -- اسید ورودی
        ISNULL(l.AcidKg, 0) AS AcidKg,
        ISNULL(l.AcidKg, 0) AS AcidIn,
        ISNULL(l.AcidUnit, N'کیلوگرم') AS AcidUnit,
        ISNULL(l.AcidNumber, 0) AS AcidNumber,
        ISNULL(l.AcidNumber, 0) AS AcidNum,
        
        -- آیزوتروپ تزریقی
        ISNULL(l.InputAzeotropeType, 0) AS InputAzeotropeType,
        ISNULL(l.InputAzeotropeAmount, 0) AS InputAzeotropeAmount,
        
        -- راکتور
        ISNULL(l.ReactorPressure, 0) AS ReactorPressure,
        ISNULL(l.ReactorPressure, 0) AS ReactorPress,
        ISNULL(l.ReactorLevel, 0) AS ReactorLevel,
        
        -- بالای ستون تقطیر
        ISNULL(l.DistillationTopTemp, 0) AS DistillationTopTemp,
        ISNULL(l.DistillationTopTemp, 0) AS DistilTopTemp,
        ISNULL(l.DistillationTopPressure, 0) AS DistillationTopPressure,
        
        -- روغن ورودی
        ISNULL(l.OilInputTemp, 0) AS OilInputTemp,
        ISNULL(l.OilInputPressure, 0) AS OilInputPressure,
        
        -- آب کندانسور
        ISNULL(l.CondenserWaterTemp, 0) AS CondenserWaterTemp,
        ISNULL(l.CondenserWaterPressure, 0) AS CondenserWaterPressure,
        ISNULL(l.CondenserOutWaterTemp, 0) AS CondenserOutWaterTemp,
        ISNULL(l.CondenserFluidTemp, 0) AS CondenserFluidTemp,
        
        -- ریفلاکس
        ISNULL(l.RefluxAmount, 0) AS RefluxAmount,
        ISNULL(l.RefluxFluidTemp, 0) AS RefluxFluidTemp,
        
        -- محصول (AZG)
        ISNULL(l.ProductSpeed, 0) AS ProductSpeed,
        ISNULL(l.ProductAmount, 0) AS ProductAmount,
        ISNULL(l.ProductDegree, 0) AS ProductDegree,
        ISNULL(l.ProductDegree, 0) AS ProductDeg,
        
        -- آبگیری (AG)
        ISNULL(l.OutputType, 1) AS OutputType,
        CASE ISNULL(l.OutputType, 1)
            WHEN 1 THEN N'ایزوتروپ'
            WHEN 2 THEN N'الکل 600'
            WHEN 3 THEN N'الکل 700'
            WHEN 4 THEN N'پساب 1300'
            WHEN 5 THEN N'آب خروجی 400'
            ELSE N'نامشخص'
        END AS OutputTypeTitle,
        ISNULL(l.AGSpeed, 0) AS AGSpeed,
        ISNULL(l.AGAmount, 0) AS AGAmount,
        ISNULL(l.AGAmount, 0) AS WaterOut,
        
        -- توضیحات و اپراتور
        ISNULL(l.Description, N'') AS [Description],
        ISNULL(l.Description, N'') AS [Desc],
        N'اپراتور سیستم' AS OperatorName,
        CONVERT(VARCHAR(10), l.CreatedDate, 120) AS CreatedDateStr,
        CONVERT(VARCHAR(8), l.CreatedDate, 108) AS CreatedTimeStr
    FROM dbo.BatchProductionLog l
    INNER JOIN dbo.Batch b ON l.BatchId = b.BatchId
    WHERE (@ReactorId IS NULL OR b.ReactorId = @ReactorId)
      AND (@BatchId IS NULL OR l.BatchId = @BatchId)
      AND (@Search IS NULL OR @Search = '' 
           OR l.Description LIKE '%' + @Search + '%' 
           OR CAST(b.BatchNum AS NVARCHAR(20)) LIKE '%' + @Search + '%')
    ORDER BY l.Id DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO
