const signupUserIntoDB = async (payload) => {
    console.log("Payload:", payload);

    const { name, email, password, role } = payload;

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
        `INSERT INTO users (name,email,password,role)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
        [name, email, hashedPassword, role]
    );

    console.log("Query Result:", result);

    const user = result.rows[0];
    delete user.password;

    return user;
};