import React from 'react';
import Image from 'next/image';
import styles from './HeaderHome.module.css';

const HeaderHome = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Image src="/path/to/logo.png" alt="Logo" className={styles.logo} width={100} height={60} />
                <div className={styles.headerText}>
                    <h1>ระบบจัดการทุนการศึกษาคณะวิทยาศาสตร์และนวัตกรรมดิจิทัล มหาวิทยาลัยทักษิณ</h1>
                    <p>Student Scholarship Management System Faculty of Science and Digital Innovation, Thaksin University</p>
                </div>
            </div>
        </header>
    );
};

export default HeaderHome;
