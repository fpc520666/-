const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// MongoDB Atlas 连接配置
const uri = "mongodb+srv://pengchengfeng209:<db_password>@cluster0.7k0ce.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// 连接MongoDB Atlas数据库
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("成功连接到 MongoDB Atlas");
}).catch((error) => {
    console.error("连接数据库失败:", error);
});

// 用户模型
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 注册接口
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({
                success: false,
                message: '用户名已存在'
            });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户
        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        res.json({
            success: true,
            message: '注册成功'
        });
    } catch (error) {
        console.error("注册错误:", error);
        res.json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 登录接口
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        res.json({
            success: true,
            message: '登录成功',
            username: user.username
        });
    } catch (error) {
        console.error("登录错误:", error);
        res.json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});