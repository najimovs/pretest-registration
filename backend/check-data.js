import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Registration from './models/Registration.js';

dotenv.config();

async function checkData() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected successfully!');

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Collections:', collections.map(c => c.name));

        // Check registrations count
        const count = await Registration.countDocuments();
        console.log('📊 Total registrations:', count);

        if (count > 0) {
            console.log('📋 Sample data:');
            const samples = await Registration.find().limit(3).select('user.firstName user.lastName user.phone status paymentStatus createdAt');
            console.log(samples);
        } else {
            console.log('ℹ️  No registrations found. Creating sample data...');

            // Create a sample registration
            const sampleRegistration = new Registration({
                user: {
                    firstName: 'Test',
                    lastName: 'User',
                    phone: '+998901234567',
                    email: 'test@example.com',
                    password: 'test123'
                },
                schedule: {
                    date: '2024-01-15',
                    time: '10:00',
                    planType: 'academic',
                    planName: 'IELTS Academic',
                    price: 100
                },
                status: 'pending',
                paymentStatus: 'pending'
            });

            await sampleRegistration.save();
            console.log('✅ Sample registration created!');
        }

        await mongoose.connection.close();
        console.log('🔒 Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkData();