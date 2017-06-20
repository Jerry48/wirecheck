/*
 * copyright@CCFLab.sjtu.edu.cn reserved, 2016
 * history:
 * 2016.03.26, created by Andy.zhou
 *  
 */
/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50621
Source Host           : localhost:3306
Source Database       : wirecheck

 Target Server Version : 50621
 File Encoding         : utf-8

 Date: 06/05/2016 21:00:06 PM
*/

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';
SET FOREIGN_KEY_CHECKS=0;

DROP database `wirecheck`;
CREATE SCHEMA IF NOT EXISTS `wirecheck` DEFAULT CHARACTER SET utf8 ;
SHOW WARNINGS;
USE `wirecheck` ;

-- ----------------------------
-- Table structure for tb_user_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_user_info`;
CREATE TABLE `tb_user_info` (
  `userId` VARCHAR(45)  NOT NULL COMMENT '用户ID',
  `userName` VARCHAR(45) NOT NULL COMMENT '用户名',
  `password` VARCHAR(45) DEFAULT NULL COMMENT '用户密码',
  `portrait` VARCHAR(200) DEFAULT NULL COMMENT '用户头像',
  `gender` int(11) DEFAULT 0 NULL COMMENT '性别,1男,2女,0未知',
  `mobile` varchar(20) DEFAULT NULL COMMENT '手机号',
  `userType` int(11) DEFAULT 0 COMMENT '用户类型, 0-普通,1-管理员',
  `name` varchar(45) DEFAULT NULL COMMENT '真实姓名',
  `loginState` int(11) DEFAULT 0 COMMENT '登陆状态，0-no， 1-yes',
  `loginTime` DATETIME NOT NULL DEFAULT now() COMMENT '注册日期',
  `sessionId` varchar(45) DEFAULT NULL COMMENT '会话id', 
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0 COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户信息表';

insert into `tb_user_info` (`userId`, `userName`, `password`, `userType`)
 values ('admin', 'admin','sjtuis123', 1);

-- ----------------------------
-- Table structure for tb_wechat_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_wechat_info`;
CREATE TABLE `tb_wechat_info` (
  `userId` VARCHAR(45)  NOT NULL COMMENT '用户ID',
  `accessToken` VARCHAR(128) NOT NULL COMMENT '用户名',
  `refreshToken` VARCHAR(128) NOT NULL COMMENT '用户名',
  `expiresIn` int DEFAULT 0 COMMENT 'token 有效期',  
  `openid` VARCHAR(45) DEFAULT NULL COMMENT '微信id',
  `scope` VARCHAR(45) DEFAULT NULL COMMENT '用户头像',
  `unionid` VARCHAR(45) DEFAULT NULL COMMENT '',
  `nickname` varchar(20) DEFAULT NULL COMMENT 'nickName',
  `subscribe` int(11) DEFAULT 0 COMMENT '0-未订阅，1-订阅',
  `sex` int(11) DEFAULT NULL COMMENT '性别,1男,2女,0未知',
  `language` varchar(45) DEFAULT NULL COMMENT 'zh_cn',
  `city` varchar(45) DEFAULT NULL COMMENT '城市',
  `province` varchar(45) DEFAULT NULL COMMENT '省份',
  `country` varchar(45) DEFAULT NULL COMMENT '国家',
  `headimageurl` varchar(45) DEFAULT NULL COMMENT '头像',
  `subscribeTime` int(11) DEFAULT 0 COMMENT '关注日期',
  `sessionId` varchar(45) DEFAULT NULL COMMENT '会话id',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0 COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户信息表';

-- ----------------------------
-- Table structure for tb_user_group_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_user_group_info`;
CREATE TABLE `tb_user_group_info` (
  `id` VARCHAR(45)  NOT NULL COMMENT '分组ID',
  `name` VARCHAR(45) NOT NULL COMMENT '分组名',
  `type` VARCHAR(45) DEFAULT NULL COMMENT '0-普通成员分组，1-other',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户分组信息表';

-- ----------------------------
-- Table structure for tb_user_group__member_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_user_group_member_info`;
CREATE TABLE `tb_user_group_member_info` (
  `id` VARCHAR(45)  NOT NULL COMMENT 'record ID',
  `groupId` VARCHAR(45)  NOT NULL COMMENT '分组ID',
  `userId` VARCHAR(45)  NOT NULL COMMENT '成员ID',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户分组成员信息表';

CREATE INDEX userGroupId ON tb_user_group_member_info (groupId);

-- ----------------------------
-- Table structure for tb_user_device_r_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_user_device_r_info`;
CREATE TABLE `tb_user_device_r_info` (
  `id` VARCHAR(45)  NOT NULL COMMENT 'record ID',
  `deviceId` VARCHAR(45)  NOT NULL COMMENT '设备ID',
  `ugId` VARCHAR(45)  NOT NULL COMMENT '访问者ID',
  `userType` int(11) DEFAULT 0 COMMENT '0-普通成员，1-group',
  `privilege` int(11) DEFAULT 1 COMMENT '用户操作权限，0-no right, 1-has right',
  `follow` int(11) DEFAULT 1 COMMENT '用户关注该设备，0-no, 1-yes',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='设备用户权限信息表';

CREATE INDEX deviceRId ON tb_user_device_r_info (deviceId);

-- ----------------------------
-- Table structure for tb_device_level_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_device_level_info`;
CREATE TABLE `tb_device_level_info` (
  `id` VARCHAR(45)  NOT NULL COMMENT 'ID',
  `name` VARCHAR(45) DEFAULT NULL COMMENT 'level name',
  `parentId` VARCHAR(45) DEFAULT NULL COMMENT '父亲id',
  `level` int(11) DEFAULT 0 COMMENT '层级',
  `comment` VARCHAR(45) DEFAULT NULL COMMENT 'comment',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='设备层级信息';

-- ----------------------------
-- Table structure for tb_device_product_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_device_product_info`;
CREATE TABLE `tb_device_product_info` (
  `id` VARCHAR(45) NOT NULL COMMENT 'ID',
  `deviceIndex` varchar(45) DEFAULT NULL COMMENT '装置序号',
  `deviceID` varchar(45) DEFAULT NULL COMMENT '设备GUID',
  `deviceName` varchar(45) DEFAULT NULL COMMENT '设备名',
  `deviceType` int(11) DEFAULT 0 COMMENT '0：图像; 1：视频',  
  `deviceManufactorName` VARCHAR(45) DEFAULT NULL COMMENT '装置厂家名称',
  `deviceModel` varchar(45) DEFAULT NULL COMMENT '装置型号',
  `deviceProductionDate` DATETIME NOT NULL DEFAULT now() COMMENT '装置生产日期',
  `deviceInstallDate` DATETIME NOT NULL DEFAULT now() COMMENT '装置安装日期',
  `deviceOrientation` varchar(45) DEFAULT NULL COMMENT '装置安装朝向',
  `deviceTele` varchar(45) DEFAULT NULL COMMENT '装置电话号码',
  `deviceMeid` varchar(45) DEFAULT NULL COMMENT '装置出厂编码',
  `deviceNetType` int(11) DEFAULT 0 COMMENT '装置屏蔽状态,1 移动；2 联通；3 电信',
  `deviceRunState` int(11) DEFAULT 0 COMMENT '装置运行状态,0 未运行；2 已运行；3 已拆除',
  `deviceShieldState` int(11) DEFAULT 0 COMMENT '装置屏蔽状态',
  `deviceDangerID` int(11) DEFAULT 0 COMMENT '装置关注隐患',
  `companyName` varchar(45) DEFAULT NULL COMMENT '供电公司名称',
  `lineName` varchar(45) DEFAULT NULL COMMENT '所属线路名称',
  `towerName` varchar(45) DEFAULT NULL COMMENT '关联杆塔名称',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='设备出厂信息';


-- ----------------------------
-- Table structure for tb_device_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_device_info`;
CREATE TABLE `tb_device_info` (
  `id` VARCHAR(45) NOT NULL COMMENT 'ID',
  `name` varchar(45) DEFAULT NULL COMMENT '监控设备名',
  `mac` varchar(45) DEFAULT NULL COMMENT '设备mac地址',
  `nickName` varchar(45) DEFAULT NULL COMMENT '设备昵称',
  `parentId` varchar(45) DEFAULT NULL COMMENT 'parent ID',  
  `comment` VARCHAR(256) DEFAULT NULL COMMENT '线路备注',
  `ip` varchar(45) DEFAULT NULL COMMENT '设备ip',
  `latitude` float DEFAULT 0 COMMENT '用户地理信息',
  `longitude` float DEFAULT 0 COMMENT '用户地理信息',
  `beatInterval` int(11) DEFAULT 0 COMMENT '心跳间隔',
  `photoInterval` int(11) DEFAULT 0 COMMENT '拍照间隔',
  `batteryVoltageLow` float DEFAULT 0 COMMENT '电池电压下限',
  `chargeVoltageLow` float DEFAULT 0 COMMENT '充电电压下限',
  `temperatureLow` float DEFAULT 0 COMMENT '温度下限',
  `batteryVoltageHigh` float DEFAULT 0 COMMENT '电池电压上限',
  `chargeVoltageHigh` float DEFAULT 0 COMMENT '充电电压上限',
  `temperatureHigh` float DEFAULT 0 COMMENT '温度上限',
  `disableAlert` int(11) DEFAULT 0 COMMENT '是否撤防，0-no, 1-yes',  
  `refPicId` varchar(45) DEFAULT NULL COMMENT 'refPicId',
  `refPicPath` varchar(45) DEFAULT NULL COMMENT 'refPicId',
  `standby` int(11) DEFAULT 0 COMMENT 'standby 模式', 
  `deviceWorkBeginTime` DATETIME NOT NULL DEFAULT now() COMMENT '装置工作开始时间',
  `deviceWorkEndTime` DATETIME NOT NULL DEFAULT now() COMMENT '装置工作结束时间', 
  `capturePeriod` int(11) DEFAULT 0 COMMENT '装置拍照间隔', 
  `photoSize` int(11) DEFAULT 0 COMMENT '装置拍照分辨率设置',
  `resolution` int(11) DEFAULT 4 COMMENT '装置拍照分辨率设置',
  `videoNumbers` int(11) DEFAULT 0 COMMENT '装置每天最多拍摄短视频次数',
  `videoLength` int(11) DEFAULT 0 COMMENT '装置拍照短视频长度',
  `deviceMemory` int(11) DEFAULT 0 COMMENT '装置内存',
  `devicePortIn` int(11) DEFAULT 0 COMMENT '装置port in',
  `devicePortOut` int(11) DEFAULT 0 COMMENT '装置port out',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='设备信息';

-- ----------------------------
-- Table structure for tb_device_roi_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_device_roi_info`;
CREATE TABLE `tb_device_roi_info` (
  `id` VARCHAR(45) NOT NULL COMMENT 'ID',
  `deviceId` varchar(45) DEFAULT NULL COMMENT '监控设备名',
  `roiPx` int(11) DEFAULT 0 COMMENT 'Roi起点X',
  `roiPy` int(11) DEFAULT 0 COMMENT 'Roi起点Y',
  `roiWidth` int(11) DEFAULT 0 COMMENT 'Roi宽度',
  `roiHeight` int(11) DEFAULT 0 COMMENT 'Roi高度',
  `priority` int(11) DEFAULT 0 COMMENT '0，1,2,数字越大，优先级越大',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='设备ROI信息';


-- ----------------------------
-- Table structure for tb_device_character_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_device_character_info`;
CREATE TABLE `tb_device_character_info` (
  `id` VARCHAR(45)  NOT NULL COMMENT 'id',
  `deviceId` VARCHAR(45) NOT NULL COMMENT '设备Id',
  `type` VARCHAR(45) DEFAULT NULL COMMENT '0-line, 1-tower,2-date,3-datetime',
  `text` VARCHAR(256) DEFAULT NULL COMMENT '字符',
  `x` float DEFAULT 0 COMMENT 'x坐标',
  `y` float DEFAULT 0 COMMENT 'y坐标',
  `enable` int(11) DEFAULT 0 COMMENT '是否启动',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='设备字符设置表';


-- ----------------------------
-- Table structure for tb_device_status_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_device_status_info`;
CREATE TABLE `tb_device_status_info` (
  `id` VARCHAR(45) NOT NULL COMMENT '监控设备id',
  `temperature` float DEFAULT 0 COMMENT '温度',
  `alert` int(11) DEFAULT 0 COMMENT '设备报警信息',
  `alertId` VARCHAR(11) NOT NULL COMMENT '告警信息id',
  `heartBeat` int(11) DEFAULT 0 COMMENT '设备心跳状态',
  `heartBeatTime` DATETIME NOT NULL DEFAULT now() COMMENT '心跳时间',
  `deviceMemoryState` int(11) DEFAULT 0 COMMENT '设备存储状态',
  `deviceMemoryCapacity` int(11) DEFAULT 0 COMMENT '设备存储容量',
  `batterySolarVoltage` float DEFAULT 0 COMMENT '设备太阳能电池电压',
  `batteryWindVoltage` float DEFAULT 0 COMMENT '设备风能电池电压',
  `batteryVoltage` float DEFAULT 0 COMMENT '电池电压',
  `chargeVoltage` float DEFAULT 0 COMMENT '充电电压',
  `batteryCapacity` float DEFAULT 0 COMMENT '设备电池容量',
  `boardTemperature` float DEFAULT 0 COMMENT '板子温度',
  `networkSignal` float DEFAULT 0 COMMENT '网络状态',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='设备状态信息';

-- ----------------------------
-- Table structure for tb_user_group_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_device_group_info`;
CREATE TABLE `tb_device_group_info` (
  `id` VARCHAR(45)  NOT NULL COMMENT '分组ID',
  `name` VARCHAR(45) NOT NULL COMMENT '分组名',
  `type` VARCHAR(45) DEFAULT NULL COMMENT '0-普通设备分组，1-巡查分组，2-标签,3-推送分组',
  `comment` VARCHAR(256) DEFAULT NULL COMMENT '设备组备注',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户分组信息表';

-- ----------------------------
-- Table structure for tb_device_group_member_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_device_group_member_info`;
CREATE TABLE `tb_device_group_member_info` (
  `id` VARCHAR(45)  NOT NULL COMMENT 'record ID',
  `groupId` VARCHAR(45)  NOT NULL COMMENT '分组ID',
  `type` VARCHAR(45) DEFAULT NULL COMMENT '0-普通设备分组，1-巡查分组，2-标签,3-推送分组',
  `deviceId` VARCHAR(45)  NOT NULL COMMENT '成员ID',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='设备分组成员信息表';

CREATE INDEX deviceGroupId ON tb_device_group_member_info (groupId);


-- ----------------------------
-- Table structure for tb_alert_log
-- ----------------------------
DROP TABLE IF EXISTS `tb_alert_log`;
CREATE TABLE `tb_alert_log` (
  `id` VARCHAR(45) NOT NULL COMMENT 'id',
  `heartId` VARCHAR(45) NOT NULL COMMENT 'heart id',
  `deviceId` VARCHAR(45) NOT NULL COMMENT '监控设备id',
  `deviceName` varchar(45) DEFAULT NULL COMMENT '监控设备名',
  `alertType` int(11) DEFAULT 0 COMMENT '报警类型',
  `temperature` float DEFAULT 0 COMMENT '温度',
  `batteryVoltage` float DEFAULT 0 COMMENT '电池电压',
  `chargeVoltage` float DEFAULT 0 COMMENT '充电电压',
  `alertMessage` varchar(256) DEFAULT 0 COMMENT '报警消息',
  `processStatus` int(11) DEFAULT 0 COMMENT '0-no, 1-yes, 2-process done',
  `alertHappenTime` DATETIME NOT NULL DEFAULT now() COMMENT '告警时间',
  `alertClearTime` DATETIME NOT NULL DEFAULT now() COMMENT '消警时间',
  `alertConfirmTime` DATETIME NOT NULL DEFAULT now() COMMENT '确认时间',
  `clearlFlag` int(11) DEFAULT 0 COMMENT '消警标志',
  `confirmFlag` int(11) DEFAULT 0 COMMENT '确认标志',
  `clearlUserId` VARCHAR(45) NOT NULL COMMENT 'clear by userid',
  `confirmUserId` VARCHAR(45) NOT NULL COMMENT 'confirm by userid',
  `picId` VARCHAR(45) NOT NULL COMMENT 'pic id',
  `picPath` VARCHAR(45) NOT NULL COMMENT 'picture path',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='报警信息记录';

CREATE INDEX alertLogtId ON tb_alert_log (deviceId);

-- ----------------------------
-- Table structure for tb_heart_beat_log
-- ----------------------------
DROP TABLE IF EXISTS `tb_heart_beat_log`;
CREATE TABLE `tb_heart_beat_log` (
  `id` VARCHAR(45) NOT NULL COMMENT 'id',
  `deviceId` VARCHAR(45) NOT NULL COMMENT '监控设备id',
  `deviceName` varchar(45) DEFAULT NULL COMMENT '监控设备名',
  `batteryVoltage` float DEFAULT 0 COMMENT '电池电压',
  `chargeVoltage` float DEFAULT 0 COMMENT '充电电压',
  `temperature` float DEFAULT 0 COMMENT '温度',
  `alert` int(11) DEFAULT 0 COMMENT '0-no, 1-yes',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='心跳信息记录';

CREATE INDEX heartBeattId ON tb_heart_beat_log (deviceId);

-- ----------------------------
-- Table structure for tb_heart_beat_lose_log
-- ----------------------------
DROP TABLE IF EXISTS `tb_heart_beat_lose_log`;
CREATE TABLE `tb_heart_beat_lose_log` (
  `id` VARCHAR(45) NOT NULL COMMENT 'id',
  `deviceId` VARCHAR(45) NOT NULL COMMENT '设备id',
  `deviceName` varchar(45) DEFAULT NULL COMMENT '监控设备名',
  `heartBeatLogId` varchar(45) DEFAULT NULL COMMENT '失联前一条心跳记录id',
  `loseTime` DATETIME NOT NULL DEFAULT now() COMMENT '失联前一条心跳记录时间',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='心跳丢失信息记录';

-- ----------------------------
-- Table structure for tb_picture_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_picture_info`;
CREATE TABLE `tb_picture_info` (
  `id` VARCHAR(45) NOT NULL COMMENT '监控设备id',
  `deviceId` VARCHAR(45) NOT NULL COMMENT '监控设备id',
  `type` int(11) DEFAULT 0 COMMENT '0-原始图片，1-处理后图片,2-参考图片',
  `path` varchar(45) DEFAULT 0 COMMENT '文件服务器相对路径',
  `pictureName` varchar(45) DEFAULT 0 COMMENT '图片名称',
  `pictureCaptureDT` DATETIME NOT NULL DEFAULT now() COMMENT '图片拍照时间',
  `pictureFileSize` int(11) DEFAULT 0 COMMENT '图片文件大小',
  `pictureSaveDT` DATETIME NOT NULL DEFAULT now() COMMENT '图片存储时间',
  `pictureUploadSpeed` int(11) DEFAULT 0 COMMENT '图片上传速率',
  `pictureAlarmFlag` int(11) DEFAULT 0 COMMENT '图片分析告警标志,0-no, 1-yes',
  `pictureWebURL` varchar(45) DEFAULT 0 COMMENT '图片访问路径URL',
  `resolution` int(11) DEFAULT 4 COMMENT '图片分辨率',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='图片信息表';

CREATE INDEX picDeviceId ON tb_picture_info (deviceId);

-- ----------------------------
-- Table structure for tb_picture_process_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_picture_process_info`;
CREATE TABLE `tb_picture_process_info` (
  `id` VARCHAR(45) NOT NULL COMMENT '监控设备id',
  `deviceId` VARCHAR(45) NOT NULL COMMENT '监控设备id',
  `deviceName` varchar(45) DEFAULT NULL COMMENT '监控设备名',
  `originalPicId` varchar(45) DEFAULT 0 COMMENT '图片id',
  `originalPicPath` varchar(128) DEFAULT 0 COMMENT '文件服务器相对路径',  
  `refPicId` varchar(45) DEFAULT 0 COMMENT 'refPicId图片id',
  `refPicPath` varchar(128) DEFAULT 0 COMMENT '参考图片路径',
  `startTime` DATETIME DEFAULT NULL COMMENT '处理开始时间',
  `endTime` DATETIME DEFAULT NULL COMMENT '处理结束时间',
  `result` int(11) DEFAULT 0 COMMENT '处理结果0-ok，1-warning, 2-fatal error',
  `status` int(11) DEFAULT 0 COMMENT '0-not start, 1-processing, 2-done',
  `comment` VARCHAR(256) DEFAULT NULL COMMENT '处理建议',
  `processedPicId` varchar(45) DEFAULT 0 COMMENT '图片id',
  `processedPicPath` varchar(128) DEFAULT 0 COMMENT '文件服务器相对路径,处理后文件',
  `processServer` varchar(32) DEFAULT 0 COMMENT '处理该照片的图片分析服务器的Hostname',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='图片处理信息表';

CREATE INDEX picDeviceId ON tb_picture_process_info (deviceId);

-- ----------------------------
-- Table structure for tb_command_log
-- ----------------------------
DROP TABLE IF EXISTS `tb_command_info`;
CREATE TABLE `tb_command_info` (
  `id` VARCHAR(45) NOT NULL COMMENT 'commandId',
  `name` VARCHAR(45) DEFAULT NULL COMMENT 'commandId',
  `type` int(11) DEFAULT 0 COMMENT '命令类型',
  `command` VARCHAR(256) DEFAULT NULL COMMENT '命令内容，json字符串，需要目标自己解析',
  `targetId` VARCHAR(45) NOT NULL COMMENT '目标id',
  `targetType` int(11) DEFAULT 0 COMMENT '0-设备，1-其它',
  `sourceId` VARCHAR(45) NOT NULL COMMENT '命令创建者',
  `sourceType` int(11) DEFAULT 0 COMMENT '0-用户，1-其它',  
  `pushState` int(11) DEFAULT NULL COMMENT '0-生成未下发, 1-已下发',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='命令处理信息表';

-- ----------------------------
-- Table structure for tb_alert_push_config_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_alert_push_config_info`;
CREATE TABLE `tb_alert_push_config_info` (
  `id` VARCHAR(45) NOT NULL COMMENT 'push config id',
  `deviceId` VARCHAR(45) NOT NULL COMMENT '告警信息来源设备id',
  `alertType` int(11) DEFAULT 0 COMMENT '0-设备工况告警，1-图片告警信息',
  `idType` int(11) NOT NULL COMMENT '0-用户，1-用户组',
  `targetId` VARCHAR(45) DEFAULT NULL COMMENT '目标id(用户id 或者 用户组id)',
  `targetType` int(11) DEFAULT 0 COMMENT '0-微信，1-手机，',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='告警推送配置记录';

CREATE INDEX alertDeviceId ON tb_alert_push_config_info (deviceId);

-- ----------------------------
-- Table structure for tb_alert_push_log
-- ----------------------------
DROP TABLE IF EXISTS `tb_alert_push_log`;
CREATE TABLE `tb_alert_push_log` (
  `id` VARCHAR(45) NOT NULL COMMENT 'push id',
  `deviceId` VARCHAR(45) NOT NULL COMMENT '告警信息来源设备id',
  `alertId` int(11) DEFAULT 0 COMMENT '告警id',
  `idType` int(11) NOT NULL COMMENT '0-用户，1-用户组',
  `targetId` VARCHAR(45) DEFAULT NULL COMMENT '目标id(用户id 或者 用户组id)',
  `targetType` int(11) DEFAULT 0 COMMENT '0-微信，1-手机，',
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='告警推送log';


-- ----------------------------
-- Table structure for tb_alert_disable_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_alert_disable_info`;
CREATE TABLE `tb_alert_disable_info` (
  `id` VARCHAR(45) NOT NULL COMMENT 'commandId',
  `deviceId` VARCHAR(45) NOT NULL COMMENT 'deviceId',
  `dayOfWeek` int(11) DEFAULT 0 COMMENT '0-sun, 1-mon,2-,',
  `fromTime` DATETIME NOT NULL DEFAULT now() COMMENT 'from time',
  `toTime` DATETIME NOT NULL DEFAULT now() COMMENT 'to time',
  `startHour` int(11) DEFAULT 0 COMMENT '',
  `startMinute` int(11) DEFAULT 0 COMMENT '',
  `endHour` int(11) DEFAULT 0 COMMENT '',
  `endMinute` int(11) DEFAULT 0 COMMENT '',  
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='撤防配置表';

CREATE INDEX alertDeviceId ON tb_alert_disable_info (deviceId);

-- ----------------------------
-- Table structure for tb_device_tag_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_device_tag_info`;
CREATE TABLE `tb_device_tag_info` (
  `id` VARCHAR(45) NOT NULL COMMENT 'commandId',
  `targetId` VARCHAR(45) NOT NULL COMMENT '目标id',
  `type` int(11) DEFAULT 0 COMMENT '0-设备, 1-设备组',
  `tag` VARCHAR(45) NOT NULL COMMENT '标签，诸如隐患点',
  `comment` VARCHAR(45) NOT NULL COMMENT 'comment',  
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='设备标签表';

CREATE INDEX tagTargetId ON tb_device_tag_info (targetId);

-- ----------------------------
-- Table structure for tb_manual_push_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_manual_push_info`;
CREATE TABLE `tb_manual_push_info` (
  `id` VARCHAR(45) NOT NULL COMMENT 'log id',
  `userId` VARCHAR(45) NOT NULL COMMENT '发起推送的用户id',
  `deviceId` VARCHAR(45) NOT NULL COMMENT '图片相关的设备id',
  `comment` VARCHAR(45) NOT NULL COMMENT 'comment',  
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='手动推送信息表';

CREATE INDEX pushDeviceId ON tb_manual_push_info (deviceId);

-- ----------------------------
-- Table structure for tb_manual_push_pic_list_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_manual_push_pic_list_info`;
CREATE TABLE `tb_manual_push_pic_list_info` (
  `id` VARCHAR(45) NOT NULL COMMENT 'log id',
  `pushId` VARCHAR(45) NOT NULL COMMENT '手动推送id',
  `picId` VARCHAR(45) NOT NULL COMMENT 'pic_id',
  `comment` VARCHAR(45) NOT NULL COMMENT 'comment',  
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='手动推送图片列表';

CREATE INDEX manualPicPushId ON tb_manual_push_pic_list_info (pushId);

-- ----------------------------
-- Table structure for tb_manual_push_target_list_info
-- ----------------------------
DROP TABLE IF EXISTS `tb_manual_push_target_list_info`;
CREATE TABLE `tb_manual_push_target_list_info` (
  `id` VARCHAR(45) NOT NULL COMMENT 'log id',
  `pushId` VARCHAR(45) NOT NULL COMMENT '手动推送id',
  `userId` VARCHAR(45) NOT NULL COMMENT '推送目标用户id',
  `comment` VARCHAR(45) NOT NULL COMMENT 'comment',  
  `createTime` DATETIME NOT NULL DEFAULT now() COMMENT '创建日期',
  `updateTime` DATETIME NOT NULL DEFAULT now() COMMENT '更新日期', 
  `state` int(11) NOT NULL DEFAULT 0  COMMENT '记录状态 0:有效 1:非法 2:删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='手动推送目标列表';

CREATE INDEX manualUserPushId ON tb_manual_push_target_list_info (pushId);

SHOW WARNINGS;

CREATE USER 'ccflab'@'localhost' IDENTIFIED BY 'CCFLabSJTUB06';

GRANT ALL privileges ON wirecheck.* TO ccflab@localhost IDENTIFIED BY 'CCFLabSJTUB06';
SHOW WARNINGS;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;




