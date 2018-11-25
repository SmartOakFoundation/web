

ALTER TABLE GameKeys 
ADD CONSTRAINT AK_GameKeys UNIQUE (Id, [EthereumLicenceId]);   
GO  

ALTER TABLE GameKeys 
ADD CONSTRAINT AK_GameKeysEth UNIQUE (GameId, [EthereumLicenceId]);   
GO 

DECLARE @AdminID nvarchar(450);
DECLARE @AdminRoleID nvarchar(450);

SELECT @AdminID = NEWID(); 

INSERT INTO [dbo].[AspNetUsers]
           ([Id]
		   ,[AccessFailedCount]
           ,[ConcurrencyStamp]
           ,[Email]
           ,[EmailConfirmed]
           ,[EthereumAccount]
           ,[LockoutEnabled]
           ,[LockoutEnd]
           ,[NormalizedEmail]
           ,[NormalizedUserName]
           ,[PasswordHash]
           ,[PhoneNumber]
           ,[PhoneNumberConfirmed]
           ,[SecurityStamp]
           ,[TwoFactorEnabled]
           ,[UserName])
     VALUES
           ( @AdminID
		   ,0
           ,'88ceecda-6bd9-46c2-9447-c726c289bfed'
           ,'test@gmail.com'
           ,1
           ,'0x64CE9cFCbCEd48F6d5091Fefb1931676c600d705'
           ,1
           ,null
           ,'TEST@GMAIL.COM'
           ,'TEST@GMAIL.COM'
           ,'AQAAAAEAACcQAAAAEApSKF9dOQTtRZTPJzJOyFsWFwyttpIa6siDaRpqaWAN0eXmh9lSsDPjvIDCRNByzQ==' --abcd1234
           ,null
           ,1
           ,'e1c46927-30dc-4c14-ab93-f470dc9f0360'
           ,0
           ,'test@gmail.com')




INSERT INTO [dbo].[AspNetRoles]([Id],[ConcurrencyStamp],[Name],[NormalizedName])
     VALUES (NEWID() ,'62868829-4217-4734-83c9-f9235dfe0151','User','USER')

SELECT @AdminRoleID = NEWID() ; 


INSERT INTO [dbo].[AspNetRoles]([Id],[ConcurrencyStamp],[Name],[NormalizedName])
     VALUES (@AdminRoleID,'aa638a55-c66e-4270-b95a-e7f75223b5a1','Admin','ADMIN')


INSERT INTO [dbo].[Games]
           ([EthereumId]
           ,[ImagePath]
           ,[Name]
           ,[Price]
           ,[ShortDescription]
		   ,[SteamLink]
		   ,[PriceUSD])
     VALUES
           (1
           ,'../img/test.jpg'
           ,'Item 1'
           ,'500000000'
           ,'Description.'
		   ,'https://www.google.pl/'
		   ,19.99)

INSERT INTO [dbo].[Games]
           ([EthereumId]
           ,[ImagePath]
           ,[Name]
           ,[Price]
           ,[ShortDescription]
		   ,[SteamLink]
		   ,[PriceUSD])
     VALUES
           (2
           ,'../img/test.jpg'
           ,'Item 2'
           ,'500000000'
           ,'Description.'
		   ,'https://www.google.pl/',
		   8.99)

INSERT INTO [dbo].[Games]
           ([EthereumId]
           ,[ImagePath]
           ,[Name]
           ,[Price]
           ,[ShortDescription]
		   ,[SteamLink]
		   ,[PriceUSD])
     VALUES
           (3
           ,'../img/test.jpg'
           ,'Item 3'
           ,'500000000'
           ,'Description.',
		   'https://www.google.pl/'
		   ,8.99)
GO



