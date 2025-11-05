# DynamoDB Table
resource "aws_dynamodb_table" "todos" {
  name         = "${local.name_prefix}-todos"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = var.stage == "prod"
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-todos-table"
  })
}

# Optional GSI for completed filter (not currently used but prepared for future)
# resource "aws_dynamodb_table" "todos" {
#   ...
#   
#   global_secondary_index {
#     name            = "CompletedIndex"
#     hash_key        = "completed"
#     projection_type = "ALL"
#   }
#   
#   attribute {
#     name = "completed"
#     type = "S"
#   }
# }
