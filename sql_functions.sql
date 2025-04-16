-- Function to get user by ID
CREATE OR REPLACE FUNCTION get_user_by_id(user_id UUID)
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user by email
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user data
CREATE OR REPLACE FUNCTION update_user(user_id UUID, user_data JSONB)
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY
    UPDATE users
    SET
      email = COALESCE(user_data->>'email', email),
      role = COALESCE(user_data->>'role', role),
      password = COALESCE(user_data->>'password', password)
    WHERE id = user_id
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete user
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM users WHERE id = user_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all teachers
CREATE OR REPLACE FUNCTION get_all_teachers()
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE role = 'teacher';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 